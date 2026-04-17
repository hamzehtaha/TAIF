namespace TAIF.Application.Interfaces.Services
{
    public interface ICurrencyConversionService
    {
        Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency);
        Task<decimal> GetRateAsync(string fromCurrency, string toCurrency);
        Task<List<string>> GetSupportedCurrenciesAsync();
        Task<Dictionary<string, decimal>> GetAllRatesAsync();
        Task UpsertRatesAsync(Dictionary<string, decimal> rates);
        Task SetRateAsync(string currencyCode, decimal rateToUsd);
        Task RemoveRateAsync(string currencyCode);
    }
}
