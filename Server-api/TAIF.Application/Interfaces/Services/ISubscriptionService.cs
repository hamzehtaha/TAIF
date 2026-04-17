using TAIF.Application.DTOs.SubscriptionDtos;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ISubscriptionService
    {
        // ── Plan discovery ────────────────────────────────────────────────────
        Task<List<PlanResponse>> GetPublicPlansAsync(string? currency = null);
        Task<PlanResponse?> GetPlanAsync(Guid planId, string? currency = null);

        // ── User subscription lifecycle ───────────────────────────────────────
        Task<UserSubscriptionResponse> SubscribeAsync(Guid userId, SubscribeToPlanRequest request);
        Task<UserSubscriptionResponse?> GetActiveSubscriptionAsync(Guid userId);
        Task<List<UserSubscriptionResponse>> GetHistoryAsync(Guid userId);
        Task CancelAsync(Guid userId, string? reason = null);
        Task<UserSubscriptionResponse> UpgradeAsync(Guid userId, UpgradePlanRequest request);
        Task<UserSubscriptionResponse> RetryPaymentAsync(Guid userId);

        // ── Feature access guards ─────────────────────────────────────────────
        Task<bool> HasFeatureAsync(Guid userId, PlanFeatureKey feature);
        Task<T> GetFeatureValueAsync<T>(Guid userId, PlanFeatureKey feature, T defaultValue);

        // ── Promo code validation ─────────────────────────────────────────────
        Task<PromoCodeValidationResponse> ValidatePromoCodeAsync(Guid userId, string code, Guid planId, decimal planPrice);

        // ── Promo code CRUD (Admin) ───────────────────────────────────────────
        Task<PromoCodeResponse> CreatePromoCodeAsync(CreatePromoCodeRequest request);
        Task<PromoCodeResponse> UpdatePromoCodeAsync(Guid promoCodeId, UpdatePromoCodeRequest request);
        Task DeletePromoCodeAsync(Guid promoCodeId);
        Task<PromoCodeResponse?> GetPromoCodeAsync(Guid promoCodeId);
        Task<List<PromoCodeResponse>> GetAllPromoCodesAsync();

        // ── Background processing ─────────────────────────────────────────────
        Task ProcessExpiredSubscriptionsAsync();
        Task SendExpiryWarningsAsync();

        // ── Admin endpoints ───────────────────────────────────────────────────
        Task<UserSubscriptionResponse> AdminAssignPlanAsync(AdminAssignPlanRequest request);
        Task<UserSubscriptionResponse> AdminExtendAsync(Guid subscriptionId, int daysToAdd);
        Task<List<UserSubscriptionResponse>> AdminGetAllAsync(SubscriptionStatus? status = null);
        Task<AdminSubscriptionDetailResponse?> AdminGetSubscriptionDetailAsync(Guid subscriptionId);
        Task<SubscriptionStatsResponse> GetStatsAsync();

        // ── Currency ──────────────────────────────────────────────────────────
        Task<List<string>> GetSupportedCurrenciesAsync();
        Task<Dictionary<string, decimal>> GetAllCurrencyRatesAsync();
        Task SetCurrencyRateAsync(string currencyCode, decimal rateToUsd);
        Task RemoveCurrencyRateAsync(string currencyCode);
        Task BulkUpsertCurrencyRatesAsync(Dictionary<string, decimal> rates);
    }
}
