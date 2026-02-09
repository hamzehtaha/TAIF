namespace TAIF.Application.Interfaces.Services
{
    public interface IJobHandler
    {
        Task ExecuteAsync(string? payload, CancellationToken cancellationToken = default);
    }
}
