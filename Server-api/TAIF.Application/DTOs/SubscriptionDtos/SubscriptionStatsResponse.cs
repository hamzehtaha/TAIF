namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record SubscriptionStatsResponse(
        int TotalActive,
        int TotalTrialing,
        int TotalCancelled,
        int TotalExpired,
        int TotalPastDue,
        int TotalSubscriptions,
        Dictionary<string, int> ByPlan,
        decimal TotalRevenue,
        decimal RevenueThisMonth,
        int NewSubscribersThisMonth,
        int CancellationsThisMonth
    );
}
