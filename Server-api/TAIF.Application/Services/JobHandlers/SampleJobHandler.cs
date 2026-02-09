using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Application.Services.JobHandlers
{
    public class SampleJobHandler : IJobHandler
    {
        private readonly ILogger<SampleJobHandler> _logger;

        public SampleJobHandler(ILogger<SampleJobHandler> logger)
        {
            _logger = logger;
        }

        public async Task ExecuteAsync(string? payload, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("SampleJob executing with payload: {Payload}", payload ?? "null");
            
            await Task.Delay(100, cancellationToken);
            
            _logger.LogInformation("SampleJob completed successfully");
        }
    }
}
