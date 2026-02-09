using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services.JobHandlers;

namespace TAIF.API.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class BackgroundJobTestingController : ControllerBase
    {
        private readonly IJobService _jobService;

        public BackgroundJobTestingController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpPost("test-job")]
        public async Task<IActionResult> TestJob()
        {
            // Run immediately
            await _jobService.AddJobAsync<SampleJobHandler>(new { Message = "Hello from API!" });

            // Or run at a specific time
            await _jobService.AddJobAsync<SampleJobHandler>(
                new { Message = "Scheduled job" },
                DateTime.UtcNow.AddMinutes(5));

            // Or run every 30 seconds (recurring)
            await _jobService.AddRecurringJobAsync<SampleJobHandler>(
                "MySampleRecurringJob",
                intervalSeconds: 30,
                new { Message = "Recurring job" });

            return Ok("Jobs scheduled!");
        }
    }
}
