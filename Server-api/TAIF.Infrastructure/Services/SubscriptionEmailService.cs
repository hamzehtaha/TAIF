using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Options;

namespace TAIF.Infrastructure.Services
{
    public class SubscriptionEmailService : ISubscriptionEmailService
    {
        private readonly EmailOptions _options;
        private readonly ILogger<SubscriptionEmailService> _logger;

        public SubscriptionEmailService(
            IOptions<EmailOptions> options,
            ILogger<SubscriptionEmailService> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task SendSubscriptionConfirmedAsync(
            User user, UserSubscription subscription, SubscriptionPlan plan, CancellationToken ct = default)
        {
            var subject = $"Welcome to {plan.Name} — your subscription is active";
            var endDateLine = subscription.EndDate.HasValue
                ? $"<p>Your subscription is valid until <strong>{subscription.EndDate.Value:MMMM dd, yyyy}</strong>.</p>"
                : string.Empty;
            var trialLine = subscription.TrialEndsAt.HasValue
                ? $"<p>You are currently in your free trial period, which ends on <strong>{subscription.TrialEndsAt.Value:MMMM dd, yyyy}</strong>.</p>"
                : string.Empty;

            var body = $@"
<p>Hi {user.FirstName} {user.LastName},</p>
<p>Thank you for subscribing to the <strong>{plan.Name}</strong> plan.</p>
{trialLine}
{endDateLine}
<p>You now have access to all features included in your plan. Enjoy learning!</p>
<p>— The TAIF Team</p>";

            await SendAsync(user.Email, subject, body, ct);
        }

        public async Task SendCancellationConfirmedAsync(
            User user, UserSubscription subscription, SubscriptionPlan plan, CancellationToken ct = default)
        {
            var accessUntil = subscription.EndDate.HasValue
                ? $"<p>You will continue to have access to {plan.Name} features until <strong>{subscription.EndDate.Value:MMMM dd, yyyy}</strong>.</p>"
                : string.Empty;

            var body = $@"
<p>Hi {user.FirstName} {user.LastName},</p>
<p>Your <strong>{plan.Name}</strong> subscription has been cancelled.</p>
{accessUntil}
<p>After that date your account will revert to the free plan. We hope to see you again!</p>
<p>— The TAIF Team</p>";

            await SendAsync(user.Email, "Your subscription has been cancelled", body, ct);
        }

        public async Task SendExpiryWarningAsync(
            User user, UserSubscription subscription, SubscriptionPlan plan, int daysRemaining, CancellationToken ct = default)
        {
            var body = $@"
<p>Hi {user.FirstName} {user.LastName},</p>
<p>Your <strong>{plan.Name}</strong> subscription is expiring in <strong>{daysRemaining} day{(daysRemaining == 1 ? "" : "s")}</strong>
   (on {subscription.EndDate!.Value:MMMM dd, yyyy}).</p>
<p>Renew now to keep uninterrupted access to all your learning content.</p>
<p>— The TAIF Team</p>";

            await SendAsync(user.Email, $"Your subscription expires in {daysRemaining} day(s)", body, ct);
        }

        public async Task SendPaymentFailedAsync(
            User user, SubscriptionPlan plan, CancellationToken ct = default)
        {
            var body = $@"
<p>Hi {user.FirstName} {user.LastName},</p>
<p>We were unable to renew your <strong>{plan.Name}</strong> subscription because the payment failed.</p>
<p>Please update your payment details to restore access. If you need help, contact support.</p>
<p>— The TAIF Team</p>";

            await SendAsync(user.Email, "Action required — subscription payment failed", body, ct);
        }

        private async Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken ct)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
                email.To.Add(MailboxAddress.Parse(recipient));
                email.Subject = subject;
                email.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

                using var smtp = new SmtpClient();
                var socketOptions = _options.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
                await smtp.ConnectAsync(_options.Host, _options.Port, socketOptions, ct);

                if (!string.IsNullOrEmpty(_options.Username))
                    await smtp.AuthenticateAsync(_options.Username, _options.Password, ct);

                await smtp.SendAsync(email, ct);
                await smtp.DisconnectAsync(true, ct);

                _logger.LogInformation("Subscription email '{Subject}' sent to {Recipient}", subject, recipient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send subscription email '{Subject}' to {Recipient}", subject, recipient);
            }
        }
    }
}
