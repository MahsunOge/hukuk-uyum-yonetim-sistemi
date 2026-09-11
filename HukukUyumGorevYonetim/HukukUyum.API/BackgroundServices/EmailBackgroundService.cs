using HukukUyum.API.Data;
using HukukUyum.API.Enums;
using HukukUyum.API.Services.Emails;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.BackgroundServices;

public class EmailBackgroundService : BackgroundService
{
    private const int MaximumRetryCount = 3;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailBackgroundService> _logger;

    public EmailBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<EmailBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "E-posta arka plan servisi başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingEmailsAsync(
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "E-posta kuyruğu işlenirken beklenmeyen bir hata oluştu.");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromSeconds(15),
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation(
            "E-posta arka plan servisi durduruldu.");
    }

    private async Task ProcessPendingEmailsAsync(
        CancellationToken cancellationToken)
    {
        using var scope =
            _scopeFactory.CreateScope();

        var context =
            scope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

        var emailSender =
            scope.ServiceProvider
                .GetRequiredService<IEmailSender>();

        var pendingEmails =
            await context.EmailOutbox
                .Where(email =>
                    email.Status == EmailStatus.Pending &&
                    email.RetryCount < MaximumRetryCount)
                .OrderBy(email => email.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

        if (pendingEmails.Count == 0)
        {
            return;
        }

        foreach (var email in pendingEmails)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                break;
            }

            email.LastAttemptAt = DateTime.UtcNow;

            try
            {
                await emailSender.SendAsync(
                    email.ToEmail,
                    email.Subject,
                    email.Body,
                    cancellationToken);

                email.Status = EmailStatus.Sent;
                email.SentAt = DateTime.UtcNow;
                email.ErrorMessage = null;

                _logger.LogInformation(
                    "E-posta gönderildi. EmailOutboxId: {EmailOutboxId}",
                    email.Id);
            }
            catch (OperationCanceledException)
                when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                email.RetryCount++;

                email.ErrorMessage =
                    exception.Message.Length > 2000
                        ? exception.Message[..2000]
                        : exception.Message;

                if (email.RetryCount >= MaximumRetryCount)
                {
                    email.Status = EmailStatus.Failed;
                }

                _logger.LogError(
                    exception,
                    "E-posta gönderilemedi. EmailOutboxId: {EmailOutboxId}, Deneme: {RetryCount}",
                    email.Id,
                    email.RetryCount);
            }

            await context.SaveChangesAsync(
                cancellationToken);
        }
    }
}