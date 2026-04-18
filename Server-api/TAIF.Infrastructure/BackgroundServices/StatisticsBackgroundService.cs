using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.BackgroundServices;

/// <summary>
/// Periodically recalculates course and learning path statistics.
/// Replaces the fire-and-forget startup Task.Run and the stats tasks previously in MaintenanceBackgroundService.
/// Courses are always calculated before learning paths (dependency order).
/// Configurable via BackgroundJobs:Statistics in appsettings.
/// </summary>
public class StatisticsBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<StatisticsBackgroundService> _logger;
    private readonly JobOptions _jobOptions;

    public StatisticsBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<StatisticsBackgroundService> logger,
        IOptions<BackgroundJobsOptions> options)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _jobOptions = options.Value.Statistics;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_jobOptions.Enabled)
        {
            _logger.LogInformation("StatisticsBackgroundService is disabled by configuration");
            return;
        }

        _logger.LogInformation("StatisticsBackgroundService started. Interval: {Interval}s, InitialDelay: {Delay}s",
            _jobOptions.IntervalSeconds, _jobOptions.InitialDelaySeconds);

        await Task.Delay(_jobOptions.InitialDelay, stoppingToken);

        using var timer = new PeriodicTimer(_jobOptions.Interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await UpdateStatisticsAsync(stoppingToken);
        }

        _logger.LogInformation("StatisticsBackgroundService stopped");
    }

    private async Task UpdateStatisticsAsync(CancellationToken ct)
    {
        // STEP 1: Update course statistics FIRST
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var courseStatsService = scope.ServiceProvider.GetRequiredService<ICourseStatisticsService>();
            _logger.LogDebug("Recalculating course statistics");
            await courseStatsService.UpdateAllCourseStatisticsAsync();
            _logger.LogDebug("Course statistics recalculated successfully");
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "Error recalculating course statistics");
        }

        // STEP 2: Update learning path statistics AFTER courses are done
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var lpStatsService = scope.ServiceProvider.GetRequiredService<ILearningPathStatisticsService>();
            _logger.LogDebug("Recalculating learning path statistics");
            await lpStatsService.UpdateAllLearningPathStatisticsAsync();
            _logger.LogDebug("Learning path statistics recalculated successfully");
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "Error recalculating learning path statistics");
        }
    }
}
