using System.Text.Json;
using TAIF.Application.DTOs.SubscriptionDtos;
using TAIF.Application.Interfaces.Payments;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionPlanRepository _planRepo;
        private readonly IUserSubscriptionRepository _subscriptionRepo;
        private readonly IPromoCodeRepository _promoCodeRepo;
        private readonly ISubscriptionPaymentRepository _paymentRepo;
        private readonly IUserRepository _userRepo;
        private readonly IPaymentGateway _paymentGateway;
        private readonly ISubscriptionEmailService _emailService;
        private readonly ICurrencyConversionService _currencyService;

        public SubscriptionService(
            ISubscriptionPlanRepository planRepo,
            IUserSubscriptionRepository subscriptionRepo,
            IPromoCodeRepository promoCodeRepo,
            ISubscriptionPaymentRepository paymentRepo,
            IUserRepository userRepo,
            IPaymentGateway paymentGateway,
            ISubscriptionEmailService emailService,
            ICurrencyConversionService currencyService)
        {
            _planRepo = planRepo;
            _subscriptionRepo = subscriptionRepo;
            _promoCodeRepo = promoCodeRepo;
            _paymentRepo = paymentRepo;
            _userRepo = userRepo;
            _paymentGateway = paymentGateway;
            _emailService = emailService;
            _currencyService = currencyService;
        }

        // ── Plan discovery ────────────────────────────────────────────────────

        public async Task<List<PlanResponse>> GetPublicPlansAsync(string? currency = null)
        {
            var plans = await _planRepo.GetPublicPlansAsync();
            var result = new List<PlanResponse>(plans.Count);
            foreach (var p in plans)
                result.Add(await MapToPlanResponseAsync(p, currency));
            return result;
        }

        public async Task<PlanResponse?> GetPlanAsync(Guid planId, string? currency = null)
        {
            var plan = await _planRepo.GetWithFeaturesAsync(planId);
            return plan is null ? null : await MapToPlanResponseAsync(plan, currency);
        }

        // ── Subscribe ─────────────────────────────────────────────────────────

        public async Task<UserSubscriptionResponse> SubscribeAsync(Guid userId, SubscribeToPlanRequest request)
        {
            var plan = await _planRepo.GetWithFeaturesAsync(request.PlanId)
                ?? throw new KeyNotFoundException("Subscription plan not found.");

            if (!plan.IsActive)
                throw new InvalidOperationException("This plan is no longer available.");

            if (plan.MonthlyPrice == 0 && plan.YearlyPrice == 0)
                throw new InvalidOperationException("The free plan is your default access level and cannot be subscribed to directly.");

            var existing = await _subscriptionRepo.GetActiveByUserIdAsync(userId);
            if (existing != null)
                throw new InvalidOperationException(
                    "You already have an active subscription. Cancel it first or use the upgrade endpoint.");

            var now = DateTime.UtcNow;
            var price = request.BillingCycle == BillingCycle.Yearly ? plan.YearlyPrice : plan.MonthlyPrice;
            var finalAmount = price;
            PromoCode? promoCode = null;

            // ── Promo code ────────────────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var validation = await ValidatePromoCodeAsync(userId, request.PromoCode, plan.Id, price);
                if (!validation.IsValid)
                    throw new InvalidOperationException(validation.ErrorMessage);

                promoCode = await _promoCodeRepo.GetByCodeAsync(request.PromoCode);
                finalAmount = validation.FinalPrice!.Value;
            }

            // ── Trial eligibility check ───────────────────────────────────
            var hasUsedTrial = await _subscriptionRepo.HasUsedTrialForPlanAsync(userId, plan.Id);
            var isTrialEligible = plan.TrialDaysCount > 0 && !hasUsedTrial;

            // ── Build subscription — ID pre-assigned so payment can reference it ─
            var trialEndsAt = isTrialEligible ? now.AddDays(plan.TrialDaysCount) : (DateTime?)null;
            var endDate = CalculateEndDate(now, request.BillingCycle);
            var subscriptionId = Guid.NewGuid();

            var subscription = new UserSubscription
            {
                Id = subscriptionId,
                UserId = userId,
                PlanId = plan.Id,
                Status = trialEndsAt.HasValue ? SubscriptionStatus.Trialing : SubscriptionStatus.Active,
                BillingCycle = request.BillingCycle,
                StartDate = now,
                EndDate = endDate,
                AutoRenew = request.AutoRenew,
                PromoCodeId = promoCode?.Id,
                PaidAmount = finalAmount,
                Currency = plan.Currency,
                TrialEndsAt = trialEndsAt,
            };

            // ── Payment BEFORE any DB write — failed charge = nothing persisted ──
            SubscriptionPayment? payment = null;
            if (finalAmount > 0 && !trialEndsAt.HasValue)
            {
                var paymentResult = await _paymentGateway.ChargeAsync(
                    new PaymentGatewayRequest(userId, subscriptionId, finalAmount, plan.Currency));

                payment = new SubscriptionPayment
                {
                    Id = Guid.NewGuid(),
                    UserSubscriptionId = subscriptionId,
                    Amount = finalAmount,
                    Currency = plan.Currency,
                    Status = paymentResult.Success ? PaymentStatus.Completed : PaymentStatus.Failed,
                    GatewayName = _paymentGateway.GatewayName,
                    GatewayTransactionId = paymentResult.TransactionId,
                    GatewayResponse = paymentResult.RawResponse,
                    PaidAt = paymentResult.Success ? now : null,
                    FailureReason = paymentResult.ErrorMessage,
                };

                if (!paymentResult.Success)
                    throw new InvalidOperationException($"Payment failed: {paymentResult.ErrorMessage}");
            }

            // ── Persist everything atomically in a single SaveChanges ─────
            await _subscriptionRepo.AddAsync(subscription);

            if (payment != null)
                await _paymentRepo.AddAsync(payment);

            if (promoCode != null)
            {
                promoCode.UsedCount++;
                promoCode.UpdatedAt = now;
                _promoCodeRepo.Update(promoCode);
                await _promoCodeRepo.AddUsageAsync(new PromoCodeUsage
                {
                    Id = Guid.NewGuid(),
                    PromoCodeId = promoCode.Id,
                    UserId = userId,
                    UserSubscriptionId = subscriptionId,
                });
            }

            await _subscriptionRepo.SaveChangesAsync();

            // ── Notification ──────────────────────────────────────────────
            var user = await _userRepo.GetByIdAsync(userId);
            if (user != null)
                await _emailService.SendSubscriptionConfirmedAsync(user, subscription, plan);

            return MapToSubscriptionResponse(subscription, plan);
        }

        // ── Get active / history ──────────────────────────────────────────────

        public async Task<UserSubscriptionResponse?> GetActiveSubscriptionAsync(Guid userId)
        {
            var subscription = await _subscriptionRepo.GetActiveByUserIdAsync(userId);
            if (subscription is null) return null;
            return MapToSubscriptionResponse(subscription, subscription.Plan);
        }

        public async Task<List<UserSubscriptionResponse>> GetHistoryAsync(Guid userId)
        {
            var history = await _subscriptionRepo.GetHistoryByUserIdAsync(userId);
            return history.Select(s => MapToSubscriptionResponse(s, s.Plan)).ToList();
        }

        // ── Cancel ────────────────────────────────────────────────────────────

        public async Task CancelAsync(Guid userId, string? reason = null)
        {
            var subscription = await _subscriptionRepo.GetActiveByUserIdAsync(userId)
                ?? throw new KeyNotFoundException("No active subscription found.");

            var now = DateTime.UtcNow;
            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.CancelledAt = now;
            subscription.CancellationReason = reason;
            subscription.AutoRenew = false;
            subscription.UpdatedAt = now;

            _subscriptionRepo.Update(subscription);
            await _subscriptionRepo.SaveChangesAsync();

            var plan = await _planRepo.GetWithFeaturesAsync(subscription.PlanId);
            var user = await _userRepo.GetByIdAsync(userId);
            if (user != null && plan != null)
                await _emailService.SendCancellationConfirmedAsync(user, subscription, plan);
        }

        // ── Upgrade ───────────────────────────────────────────────────────────

        public async Task<UserSubscriptionResponse> UpgradeAsync(Guid userId, UpgradePlanRequest request)
        {
            var newPlan = await _planRepo.GetWithFeaturesAsync(request.NewPlanId)
                ?? throw new KeyNotFoundException("Target plan not found.");

            if (!newPlan.IsActive)
                throw new InvalidOperationException("The target plan is no longer available.");

            var current = await _subscriptionRepo.GetActiveByUserIdAsync(userId);
            var now = DateTime.UtcNow;

            if (current != null && current.PlanId == request.NewPlanId && current.BillingCycle == request.BillingCycle)
                throw new InvalidOperationException("You are already subscribed to this plan with the same billing cycle.");

            // ── Calculate prorated charge ─────────────────────────────────
            var newPrice = request.BillingCycle == BillingCycle.Yearly
                ? newPlan.YearlyPrice
                : newPlan.MonthlyPrice;

            decimal chargeAmount = newPrice;

            if (current != null && current.PaidAmount > 0 && current.EndDate.HasValue)
            {
                var totalCycleDays = current.BillingCycle == BillingCycle.Yearly ? 365.0 : 30.0;
                var daysRemaining = Math.Max(0, (current.EndDate.Value - now).TotalDays);
                var prorateFraction = daysRemaining / totalCycleDays;
                var creditAmount = (decimal)prorateFraction * current.PaidAmount;
                chargeAmount = Math.Max(0, newPrice - creditAmount);
            }

            // ── Charge payment FIRST — old subscription stays active if this fails ──
            var newSubscriptionId = Guid.NewGuid();
            SubscriptionPayment? payment = null;
            if (chargeAmount > 0)
            {
                var paymentResult = await _paymentGateway.ChargeAsync(
                    new PaymentGatewayRequest(userId, newSubscriptionId, chargeAmount, newPlan.Currency));

                if (!paymentResult.Success)
                    throw new InvalidOperationException($"Upgrade payment failed: {paymentResult.ErrorMessage}");

                payment = new SubscriptionPayment
                {
                    Id = Guid.NewGuid(),
                    UserSubscriptionId = newSubscriptionId,
                    Amount = chargeAmount,
                    Currency = newPlan.Currency,
                    Status = PaymentStatus.Completed,
                    GatewayName = _paymentGateway.GatewayName,
                    GatewayTransactionId = paymentResult.TransactionId,
                    GatewayResponse = paymentResult.RawResponse,
                    PaidAt = now,
                };
            }

            // ── Cancel current subscription (only after payment is confirmed) ──
            if (current != null)
            {
                current.Status = SubscriptionStatus.Cancelled;
                current.CancelledAt = now;
                current.CancellationReason = "Upgraded to a different plan";
                current.AutoRenew = false;
                current.UpdatedAt = now;
                _subscriptionRepo.Update(current);
            }

            // ── Create new subscription ───────────────────────────────────
            var endDate = CalculateEndDate(now, request.BillingCycle);

            var newSubscription = new UserSubscription
            {
                Id = newSubscriptionId,
                UserId = userId,
                PlanId = newPlan.Id,
                Status = SubscriptionStatus.Active,
                BillingCycle = request.BillingCycle,
                StartDate = now,
                EndDate = endDate,
                AutoRenew = true,
                PaidAmount = chargeAmount,
                Currency = newPlan.Currency,
            };

            await _subscriptionRepo.AddAsync(newSubscription);
            if (payment != null)
                await _paymentRepo.AddAsync(payment);

            await _subscriptionRepo.SaveChangesAsync();

            var user = await _userRepo.GetByIdAsync(userId);
            if (user != null)
                await _emailService.SendSubscriptionConfirmedAsync(user, newSubscription, newPlan);

            return MapToSubscriptionResponse(newSubscription, newPlan);
        }

        // ── Retry Payment ─────────────────────────────────────────────────────

        public async Task<UserSubscriptionResponse> RetryPaymentAsync(Guid userId)
        {
            var subscription = await _subscriptionRepo.GetActiveByUserIdAsync(userId)
                ?? throw new KeyNotFoundException("No subscription found.");

            if (subscription.Status != SubscriptionStatus.PastDue)
                throw new InvalidOperationException("Payment retry is only available for past-due subscriptions.");

            var plan = subscription.Plan ?? await _planRepo.GetWithFeaturesAsync(subscription.PlanId)
                ?? throw new InvalidOperationException("Plan not found.");

            var now = DateTime.UtcNow;
            var amount = subscription.PaidAmount;

            var paymentResult = await _paymentGateway.ChargeAsync(
                new PaymentGatewayRequest(userId, subscription.Id, amount, subscription.Currency));

            var payment = new SubscriptionPayment
            {
                Id = Guid.NewGuid(),
                UserSubscriptionId = subscription.Id,
                Amount = amount,
                Currency = subscription.Currency,
                Status = paymentResult.Success ? PaymentStatus.Completed : PaymentStatus.Failed,
                GatewayName = _paymentGateway.GatewayName,
                GatewayTransactionId = paymentResult.TransactionId,
                GatewayResponse = paymentResult.RawResponse,
                PaidAt = paymentResult.Success ? now : null,
                FailureReason = paymentResult.ErrorMessage,
            };

            await _paymentRepo.AddAsync(payment);

            if (paymentResult.Success)
            {
                subscription.Status = SubscriptionStatus.Active;
                subscription.EndDate = CalculateEndDate(now, subscription.BillingCycle);
                subscription.UpdatedAt = now;
                _subscriptionRepo.Update(subscription);
            }

            await _subscriptionRepo.SaveChangesAsync();

            if (!paymentResult.Success)
                throw new InvalidOperationException($"Payment retry failed: {paymentResult.ErrorMessage}");

            return MapToSubscriptionResponse(subscription, plan);
        }

        // ── Feature guards ────────────────────────────────────────────────────

        public async Task<bool> HasFeatureAsync(Guid userId, PlanFeatureKey feature)
        {
            var raw = await GetRawFeatureValueAsync(userId, feature);
            if (raw is null) return false;

            return raw.ToLowerInvariant() switch
            {
                "true" or "1" => true,
                _              => false,
            };
        }

        public async Task<T> GetFeatureValueAsync<T>(Guid userId, PlanFeatureKey feature, T defaultValue)
        {
            var raw = await GetRawFeatureValueAsync(userId, feature);
            if (raw is null) return defaultValue;

            try { return (T)Convert.ChangeType(raw, typeof(T)); }
            catch { return defaultValue; }
        }

        private async Task<string?> GetRawFeatureValueAsync(Guid userId, PlanFeatureKey feature)
        {
            var subscription = await _subscriptionRepo.GetActiveByUserIdAsync(userId);

            SubscriptionPlan? plan;
            if (subscription is null)
            {
                plan = await _planRepo.GetFreePlanAsync();
            }
            else
            {
                plan = subscription.Plan ?? await _planRepo.GetWithFeaturesAsync(subscription.PlanId);
            }

            return plan?.Features.FirstOrDefault(f => f.FeatureKey == feature)?.Value;
        }

        // ── Promo code validation ─────────────────────────────────────────────

        public async Task<PromoCodeValidationResponse> ValidatePromoCodeAsync(
            Guid userId, string code, Guid planId, decimal planPrice)
        {
            var normalizedCode = code.ToUpperInvariant();
            var promo = await _promoCodeRepo.GetByCodeAsync(normalizedCode);

            if (promo is null || !promo.IsActive)
                return Fail("Invalid or inactive promo code.");

            if (promo.IsDeleted)
                return Fail("Invalid or inactive promo code.");

            if (promo.ExpiresAt.HasValue && promo.ExpiresAt < DateTime.UtcNow)
                return Fail("Promo code has expired.");

            if (promo.MaxUses.HasValue && promo.UsedCount >= promo.MaxUses)
                return Fail("Promo code usage limit has been reached.");

            if (promo.MaxUsesPerUser.HasValue)
            {
                var userUses = await _promoCodeRepo.GetUserUsageCountAsync(promo.Id, userId);
                if (userUses >= promo.MaxUsesPerUser)
                    return Fail("You have already used this promo code the maximum number of times.");
            }

            if (!string.IsNullOrEmpty(promo.ApplicablePlanIds))
            {
                var applicableIds = JsonSerializer.Deserialize<List<Guid>>(promo.ApplicablePlanIds) ?? [];
                if (applicableIds.Count > 0 && !applicableIds.Contains(planId))
                    return Fail("This promo code is not valid for the selected plan.");
            }

            var discountAmount = Math.Round(planPrice * (promo.DiscountPercent / 100m), 2);
            var finalPrice = Math.Max(0, planPrice - discountAmount);

            return new PromoCodeValidationResponse(true, null, discountAmount, finalPrice);

            static PromoCodeValidationResponse Fail(string msg) =>
                new(false, msg, null, null);
        }

        // ── Promo code CRUD (Admin) ───────────────────────────────────────────

        public async Task<PromoCodeResponse> CreatePromoCodeAsync(CreatePromoCodeRequest request)
        {
            var normalizedCode = request.Code.ToUpperInvariant();

            if (await _promoCodeRepo.CodeExistsAsync(normalizedCode))
                throw new InvalidOperationException($"A promo code with code '{normalizedCode}' already exists.");

            var promo = new PromoCode
            {
                Id = Guid.NewGuid(),
                Code = normalizedCode,
                Description = request.Description,
                DiscountPercent = request.DiscountPercent,
                MaxUses = request.MaxUses,
                MaxUsesPerUser = request.MaxUsesPerUser,
                ExpiresAt = request.ExpiresAt,
                IsActive = true,
                ApplicablePlanIds = request.ApplicablePlanIds != null && request.ApplicablePlanIds.Count > 0
                    ? JsonSerializer.Serialize(request.ApplicablePlanIds)
                    : null,
            };

            await _promoCodeRepo.AddAsync(promo);
            await _promoCodeRepo.SaveChangesAsync();

            return MapToPromoCodeResponse(promo);
        }

        public async Task<PromoCodeResponse> UpdatePromoCodeAsync(Guid promoCodeId, UpdatePromoCodeRequest request)
        {
            var promo = await _promoCodeRepo.GetByIdAsync(promoCodeId)
                ?? throw new KeyNotFoundException("Promo code not found.");

            var now = DateTime.UtcNow;

            if (request.Description != null)
                promo.Description = request.Description;
            if (request.DiscountPercent.HasValue)
                promo.DiscountPercent = request.DiscountPercent.Value;
            if (request.MaxUses.HasValue)
                promo.MaxUses = request.MaxUses;
            if (request.MaxUsesPerUser.HasValue)
                promo.MaxUsesPerUser = request.MaxUsesPerUser;
            if (request.ExpiresAt.HasValue)
                promo.ExpiresAt = request.ExpiresAt;
            if (request.IsActive.HasValue)
                promo.IsActive = request.IsActive.Value;
            if (request.ApplicablePlanIds != null)
                promo.ApplicablePlanIds = request.ApplicablePlanIds.Count > 0
                    ? JsonSerializer.Serialize(request.ApplicablePlanIds)
                    : null;

            promo.UpdatedAt = now;
            _promoCodeRepo.Update(promo);
            await _promoCodeRepo.SaveChangesAsync();

            return MapToPromoCodeResponse(promo);
        }

        public async Task DeletePromoCodeAsync(Guid promoCodeId)
        {
            var promo = await _promoCodeRepo.GetByIdAsync(promoCodeId)
                ?? throw new KeyNotFoundException("Promo code not found.");

            _promoCodeRepo.SoftDelete(promo);
            await _promoCodeRepo.SaveChangesAsync();
        }

        public async Task<PromoCodeResponse?> GetPromoCodeAsync(Guid promoCodeId)
        {
            var promo = await _promoCodeRepo.GetByIdAsync(promoCodeId);
            return promo is null ? null : MapToPromoCodeResponse(promo);
        }

        public async Task<List<PromoCodeResponse>> GetAllPromoCodesAsync()
        {
            var codes = await _promoCodeRepo.GetAllActiveAsync();
            return codes.Select(MapToPromoCodeResponse).ToList();
        }

        // ── Background processing ─────────────────────────────────────────────

        public async Task ProcessExpiredSubscriptionsAsync()
        {
            var expired = await _subscriptionRepo.GetExpiredAsync();
            var now = DateTime.UtcNow;

            foreach (var subscription in expired)
            {
                if (subscription.Status == SubscriptionStatus.Cancelled || !subscription.AutoRenew)
                {
                    subscription.Status = SubscriptionStatus.Expired;
                }
                else
                {
                    subscription.Status = SubscriptionStatus.PastDue;
                    if (subscription.User != null)
                    {
                        var plan = subscription.Plan ?? await _planRepo.GetWithFeaturesAsync(subscription.PlanId);
                        if (plan != null)
                            await _emailService.SendPaymentFailedAsync(subscription.User, plan);
                    }
                }

                subscription.UpdatedAt = now;
                _subscriptionRepo.Update(subscription);
            }

            if (expired.Count > 0)
                await _subscriptionRepo.SaveChangesAsync();
        }

        public async Task SendExpiryWarningsAsync()
        {
            var expiring = await _subscriptionRepo.GetExpiringWithinDaysAsync(7);

            foreach (var subscription in expiring)
            {
                if (subscription.User is null || subscription.Plan is null) continue;

                var daysRemaining = subscription.EndDate.HasValue
                    ? (int)Math.Ceiling((subscription.EndDate.Value - DateTime.UtcNow).TotalDays)
                    : 0;

                await _emailService.SendExpiryWarningAsync(
                    subscription.User, subscription, subscription.Plan, daysRemaining);
            }
        }

        // ── Admin ─────────────────────────────────────────────────────────────

        public async Task<UserSubscriptionResponse> AdminAssignPlanAsync(AdminAssignPlanRequest request)
        {
            var plan = await _planRepo.GetWithFeaturesAsync(request.PlanId)
                ?? throw new KeyNotFoundException("Plan not found.");

            var existing = await _subscriptionRepo.GetActiveByUserIdAsync(request.UserId);
            if (existing != null)
            {
                existing.Status = SubscriptionStatus.Cancelled;
                existing.CancelledAt = DateTime.UtcNow;
                existing.CancellationReason = "Admin plan assignment";
                existing.AutoRenew = false;
                existing.UpdatedAt = DateTime.UtcNow;
                _subscriptionRepo.Update(existing);
                await _subscriptionRepo.SaveChangesAsync();
            }

            var now = DateTime.UtcNow;
            var subscription = new UserSubscription
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                PlanId = plan.Id,
                Status = SubscriptionStatus.Active,
                BillingCycle = request.BillingCycle,
                StartDate = now,
                EndDate = CalculateEndDate(now, request.BillingCycle),
                AutoRenew = request.AutoRenew,
                PaidAmount = 0,
                Currency = plan.Currency,
            };

            await _subscriptionRepo.AddAsync(subscription);
            await _subscriptionRepo.SaveChangesAsync();

            return MapToSubscriptionResponse(subscription, plan);
        }

        public async Task<UserSubscriptionResponse> AdminExtendAsync(Guid subscriptionId, int daysToAdd)
        {
            if (daysToAdd <= 0)
                throw new InvalidOperationException("DaysToAdd must be a positive number.");

            var subscription = await _subscriptionRepo.GetByIdAsync(subscriptionId)
                ?? throw new KeyNotFoundException("Subscription not found.");

            if (!subscription.EndDate.HasValue)
                throw new InvalidOperationException("Cannot extend a subscription with no end date.");

            var now = DateTime.UtcNow;
            subscription.EndDate = subscription.EndDate.Value.AddDays(daysToAdd);
            subscription.UpdatedAt = now;

            if (subscription.Status == SubscriptionStatus.Expired)
                subscription.Status = SubscriptionStatus.Active;

            _subscriptionRepo.Update(subscription);
            await _subscriptionRepo.SaveChangesAsync();

            var plan = await _planRepo.GetWithFeaturesAsync(subscription.PlanId)
                       ?? throw new InvalidOperationException("Plan not found.");
            return MapToSubscriptionResponse(subscription, plan);
        }

        public async Task<List<UserSubscriptionResponse>> AdminGetAllAsync(SubscriptionStatus? status = null)
        {
            var all = await _subscriptionRepo.GetAllWithPlansAsync(status);
            return all.Select(s => MapToSubscriptionResponse(s, s.Plan)).ToList();
        }

        public async Task<AdminSubscriptionDetailResponse?> AdminGetSubscriptionDetailAsync(Guid subscriptionId)
        {
            var sub = await _subscriptionRepo.GetWithDetailsAsync(subscriptionId);
            if (sub is null) return null;

            var now = DateTime.UtcNow;
            var daysRemaining = sub.EndDate.HasValue
                ? (int?)Math.Max(0, (int)Math.Ceiling((sub.EndDate.Value - now).TotalDays))
                : null;

            var payments = sub.Payments
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentHistoryItem(
                    p.Id,
                    p.Amount,
                    p.Currency,
                    p.Status,
                    p.GatewayName,
                    p.GatewayTransactionId,
                    p.PaidAt,
                    p.FailureReason,
                    p.CreatedAt
                )).ToList();

            return new AdminSubscriptionDetailResponse(
                sub.Id,
                sub.UserId,
                sub.User?.Email ?? "unknown",
                sub.User != null ? $"{sub.User.FirstName} {sub.User.LastName}" : "unknown",
                sub.PlanId,
                sub.Plan?.Name ?? "unknown",
                sub.Status,
                sub.BillingCycle,
                sub.StartDate,
                sub.EndDate,
                sub.AutoRenew,
                sub.PaidAmount,
                sub.Currency,
                sub.TrialEndsAt,
                IsInTrial: sub.TrialEndsAt.HasValue && sub.TrialEndsAt > now,
                DaysRemaining: daysRemaining,
                sub.CancelledAt,
                sub.CancellationReason,
                payments
            );
        }

        public async Task<SubscriptionStatsResponse> GetStatsAsync()
        {
            var all = await _subscriptionRepo.GetAllWithPlansAsync();
            var totalRevenue = await _paymentRepo.GetTotalRevenueAsync();

            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthEnd = monthStart.AddMonths(1);

            var revenueThisMonth = await _paymentRepo.GetRevenueForPeriodAsync(monthStart, monthEnd);
            var newSubscribersThisMonth = await _subscriptionRepo.GetNewSubscriptionsCountAsync(monthStart, monthEnd);
            var cancellationsThisMonth = await _subscriptionRepo.GetCancellationsCountAsync(monthStart, monthEnd);

            var byPlan = all
                .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trialing)
                .GroupBy(s => s.Plan?.Name ?? s.PlanId.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            return new SubscriptionStatsResponse(
                TotalActive: all.Count(s => s.Status == SubscriptionStatus.Active),
                TotalTrialing: all.Count(s => s.Status == SubscriptionStatus.Trialing),
                TotalCancelled: all.Count(s => s.Status == SubscriptionStatus.Cancelled),
                TotalExpired: all.Count(s => s.Status == SubscriptionStatus.Expired),
                TotalPastDue: all.Count(s => s.Status == SubscriptionStatus.PastDue),
                TotalSubscriptions: all.Count,
                ByPlan: byPlan,
                TotalRevenue: totalRevenue,
                RevenueThisMonth: revenueThisMonth,
                NewSubscribersThisMonth: newSubscribersThisMonth,
                CancellationsThisMonth: cancellationsThisMonth
            );
        }

        // ── Currency ──────────────────────────────────────────────────────────

        public async Task<List<string>> GetSupportedCurrenciesAsync()
        {
            return await _currencyService.GetSupportedCurrenciesAsync();
        }

        public async Task<Dictionary<string, decimal>> GetAllCurrencyRatesAsync()
        {
            return await _currencyService.GetAllRatesAsync();
        }

        public async Task SetCurrencyRateAsync(string currencyCode, decimal rateToUsd)
        {
            await _currencyService.SetRateAsync(currencyCode, rateToUsd);
        }

        public async Task RemoveCurrencyRateAsync(string currencyCode)
        {
            await _currencyService.RemoveRateAsync(currencyCode);
        }

        public async Task BulkUpsertCurrencyRatesAsync(Dictionary<string, decimal> rates)
        {
            await _currencyService.UpsertRatesAsync(rates);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static DateTime CalculateEndDate(DateTime start, BillingCycle cycle) => cycle switch
        {
            BillingCycle.Monthly => start.AddMonths(1),
            BillingCycle.Yearly  => start.AddYears(1),
            _                    => start.AddMonths(1),
        };

        private async Task<PlanResponse> MapToPlanResponseAsync(SubscriptionPlan plan, string? targetCurrency = null)
        {
            var monthlyPrice = plan.MonthlyPrice;
            var yearlyPrice = plan.YearlyPrice;
            var currency = plan.Currency;

            if (!string.IsNullOrWhiteSpace(targetCurrency) &&
                !string.Equals(targetCurrency, plan.Currency, StringComparison.OrdinalIgnoreCase))
            {
                monthlyPrice = await _currencyService.ConvertAsync(plan.MonthlyPrice, plan.Currency, targetCurrency);
                yearlyPrice = await _currencyService.ConvertAsync(plan.YearlyPrice, plan.Currency, targetCurrency);
                currency = targetCurrency.ToUpperInvariant();
            }

            return new PlanResponse(
                plan.Id,
                plan.Name,
                plan.Description,
                monthlyPrice,
                yearlyPrice,
                plan.YearlyDiscountPercent,
                currency,
                plan.TrialDaysCount,
                plan.DisplayOrder,
                plan.Features.ToDictionary(f => f.FeatureKey.ToString(), f => f.Value)
            );
        }

        internal static UserSubscriptionResponse MapToSubscriptionResponse(
            UserSubscription sub, SubscriptionPlan plan)
        {
            var now = DateTime.UtcNow;
            var daysRemaining = sub.EndDate.HasValue
                ? (int?)Math.Max(0, (int)Math.Ceiling((sub.EndDate.Value - now).TotalDays))
                : null;

            return new(
                sub.Id,
                sub.PlanId,
                plan.Name,
                sub.Status,
                sub.BillingCycle,
                sub.StartDate,
                sub.EndDate,
                sub.AutoRenew,
                sub.PaidAmount,
                sub.Currency,
                sub.TrialEndsAt,
                IsInTrial: sub.TrialEndsAt.HasValue && sub.TrialEndsAt > now,
                DaysRemaining: daysRemaining,
                Features: plan.Features?.ToDictionary(f => f.FeatureKey.ToString(), f => f.Value) ?? new()
            );
        }

        private static PromoCodeResponse MapToPromoCodeResponse(PromoCode promo)
        {
            List<Guid>? applicablePlanIds = null;
            if (!string.IsNullOrEmpty(promo.ApplicablePlanIds))
                applicablePlanIds = JsonSerializer.Deserialize<List<Guid>>(promo.ApplicablePlanIds);

            return new PromoCodeResponse(
                promo.Id,
                promo.Code,
                promo.Description,
                promo.DiscountPercent,
                promo.MaxUses,
                promo.UsedCount,
                promo.MaxUsesPerUser,
                promo.ExpiresAt,
                promo.IsActive,
                applicablePlanIds,
                promo.CreatedAt
            );
        }
    }
}
