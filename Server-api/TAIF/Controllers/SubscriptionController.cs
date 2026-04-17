using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.SubscriptionDtos;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/subscriptions")]
    [ApiController]
    public class SubscriptionController : TaifControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        // ── Public / authenticated user endpoints ─────────────────────────────

        /// <summary>Returns all publicly visible subscription plans. Optionally convert prices to a different currency.</summary>
        [HttpGet("plans")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlans([FromQuery] string? currency = null)
        {
            var plans = await _subscriptionService.GetPublicPlansAsync(currency);
            return Ok(plans);
        }

        /// <summary>Returns a single plan by id. Optionally convert prices to a different currency.</summary>
        [HttpGet("plans/{planId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlan(Guid planId, [FromQuery] string? currency = null)
        {
            var plan = await _subscriptionService.GetPlanAsync(planId, currency);
            if (plan is null) return NotFound();
            return Ok(plan);
        }

        /// <summary>Returns all supported currencies for price conversion.</summary>
        [HttpGet("currencies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSupportedCurrencies()
        {
            var currencies = await _subscriptionService.GetSupportedCurrenciesAsync();
            return Ok(currencies);
        }

        /// <summary>Returns the calling user's currently active subscription, or 404 if none.</summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMySubscription()
        {
            var subscription = await _subscriptionService.GetActiveSubscriptionAsync(UserId);
            if (subscription is null) return NotFound(new { message = "No active subscription. You are on the free plan." });
            return Ok(subscription);
        }

        /// <summary>Returns the calling user's full subscription history.</summary>
        [HttpGet("my/history")]
        [Authorize]
        public async Task<IActionResult> GetMyHistory()
        {
            var history = await _subscriptionService.GetHistoryAsync(UserId);
            return Ok(history);
        }

        /// <summary>Subscribe the calling user to a plan. Only students can subscribe.</summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeToPlanRequest request)
        {
            if (Role != UserRoleType.Student)
                return Forbid();

            var result = await _subscriptionService.SubscribeAsync(UserId, request);
            return CreatedAtAction(nameof(GetMySubscription), result);
        }

        /// <summary>Cancel the calling user's active subscription (access continues until EndDate). Only students can cancel.</summary>
        [HttpPost("cancel")]
        [Authorize]
        public async Task<IActionResult> Cancel([FromBody] CancelSubscriptionRequest request)
        {
            if (Role != UserRoleType.Student)
                return Forbid();

            await _subscriptionService.CancelAsync(UserId, request.Reason);
            return Ok(new { message = "Subscription cancelled. You will retain access until the end of your billing period." });
        }

        /// <summary>Upgrade (or downgrade) to a different plan. Charges a prorated difference immediately. Only students can upgrade.</summary>
        [HttpPost("upgrade")]
        [Authorize]
        public async Task<IActionResult> Upgrade([FromBody] UpgradePlanRequest request)
        {
            if (Role != UserRoleType.Student)
                return Forbid();

            var result = await _subscriptionService.UpgradeAsync(UserId, request);
            return Ok(result);
        }

        /// <summary>Retry a failed payment for a past-due subscription. Only students can retry.</summary>
        [HttpPost("retry-payment")]
        [Authorize]
        public async Task<IActionResult> RetryPayment()
        {
            if (Role != UserRoleType.Student)
                return Forbid();

            var result = await _subscriptionService.RetryPaymentAsync(UserId);
            return Ok(result);
        }

        /// <summary>Validates a promo code before checkout.</summary>
        [HttpPost("validate-promo")]
        [Authorize]
        public async Task<IActionResult> ValidatePromoCode([FromBody] ValidatePromoCodeRequest request)
        {
            var plan = await _subscriptionService.GetPlanAsync(request.PlanId);
            if (plan is null) return NotFound(new { message = "Plan not found." });

            var price = request.BillingCycle == BillingCycle.Yearly ? plan.YearlyPrice : plan.MonthlyPrice;
            var result = await _subscriptionService.ValidatePromoCodeAsync(UserId, request.Code, request.PlanId, price);
            return Ok(result);
        }

        // ── Admin endpoints ───────────────────────────────────────────────────

        /// <summary>Returns all subscriptions (optionally filtered by status).</summary>
        [HttpGet("admin/all")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> AdminGetAll([FromQuery] SubscriptionStatus? status = null)
        {
            var all = await _subscriptionService.AdminGetAllAsync(status);
            return Ok(all);
        }

        /// <summary>Returns detailed subscription info including user details and payment history.</summary>
        [HttpGet("admin/{subscriptionId:guid}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> AdminGetSubscriptionDetail(Guid subscriptionId)
        {
            var detail = await _subscriptionService.AdminGetSubscriptionDetailAsync(subscriptionId);
            if (detail is null) return NotFound();
            return Ok(detail);
        }

        /// <summary>Returns subscription revenue and count statistics.</summary>
        [HttpGet("admin/stats")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _subscriptionService.GetStatsAsync();
            return Ok(stats);
        }

        /// <summary>Manually assigns a plan to any user (no payment charged).</summary>
        [HttpPost("admin/assign")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> AdminAssign([FromBody] AdminAssignPlanRequest request)
        {
            var result = await _subscriptionService.AdminAssignPlanAsync(request);
            return Ok(result);
        }

        /// <summary>Extends the end date of a subscription by the given number of days.</summary>
        [HttpPatch("admin/{subscriptionId:guid}/extend")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> AdminExtend(Guid subscriptionId, [FromBody] ExtendSubscriptionRequest request)
        {
            var result = await _subscriptionService.AdminExtendAsync(subscriptionId, request.DaysToAdd);
            return Ok(result);
        }

        // ── Promo code CRUD (Admin) ───────────────────────────────────────────

        /// <summary>Returns all promo codes.</summary>
        [HttpGet("admin/promo-codes")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetAllPromoCodes()
        {
            var codes = await _subscriptionService.GetAllPromoCodesAsync();
            return Ok(codes);
        }

        /// <summary>Returns a single promo code by ID.</summary>
        [HttpGet("admin/promo-codes/{promoCodeId:guid}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetPromoCode(Guid promoCodeId)
        {
            var code = await _subscriptionService.GetPromoCodeAsync(promoCodeId);
            if (code is null) return NotFound();
            return Ok(code);
        }

        /// <summary>Creates a new promo code.</summary>
        [HttpPost("admin/promo-codes")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> CreatePromoCode([FromBody] CreatePromoCodeRequest request)
        {
            var result = await _subscriptionService.CreatePromoCodeAsync(request);
            return CreatedAtAction(nameof(GetPromoCode), new { promoCodeId = result.Id }, result);
        }

        /// <summary>Updates an existing promo code.</summary>
        [HttpPut("admin/promo-codes/{promoCodeId:guid}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> UpdatePromoCode(Guid promoCodeId, [FromBody] UpdatePromoCodeRequest request)
        {
            var result = await _subscriptionService.UpdatePromoCodeAsync(promoCodeId, request);
            return Ok(result);
        }

        /// <summary>Soft-deletes a promo code.</summary>
        [HttpDelete("admin/promo-codes/{promoCodeId:guid}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> DeletePromoCode(Guid promoCodeId)
        {
            await _subscriptionService.DeletePromoCodeAsync(promoCodeId);
            return NoContent();
        }

        // ── Currency rate management (Admin) ──────────────────────────────────

        /// <summary>Returns all currency exchange rates (relative to USD).</summary>
        [HttpGet("admin/currency-rates")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetAllCurrencyRates()
        {
            var rates = await _subscriptionService.GetAllCurrencyRatesAsync();
            return Ok(rates);
        }

        /// <summary>Sets or updates the exchange rate for a single currency.</summary>
        [HttpPut("admin/currency-rates/{currencyCode}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> SetCurrencyRate(string currencyCode, [FromBody] SetCurrencyRateRequest request)
        {
            await _subscriptionService.SetCurrencyRateAsync(currencyCode, request.RateToUsd);
            return Ok(new { message = $"Rate for {currencyCode.ToUpperInvariant()} updated to {request.RateToUsd}." });
        }

        /// <summary>Bulk upsert multiple currency rates at once (useful for external rate update services).</summary>
        [HttpPost("admin/currency-rates/bulk")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> BulkUpsertCurrencyRates([FromBody] Dictionary<string, decimal> rates)
        {
            await _subscriptionService.BulkUpsertCurrencyRatesAsync(rates);
            return Ok(new { message = $"{rates.Count} currency rate(s) upserted." });
        }

        /// <summary>Removes (soft-deletes) a currency rate.</summary>
        [HttpDelete("admin/currency-rates/{currencyCode}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> RemoveCurrencyRate(string currencyCode)
        {
            await _subscriptionService.RemoveCurrencyRateAsync(currencyCode);
            return NoContent();
        }
    }
}
