using HukukUyum.API.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace HukukUyum.API.Services.Emails;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _settings;

    public SmtpEmailSender(
        IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SendAsync(
        string toEmail,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new ArgumentException(
                "Alıcı e-posta adresi boş olamaz.",
                nameof(toEmail));
        }

        var message = new MimeMessage();

        message.From.Add(
            new MailboxAddress(
                _settings.SenderName,
                _settings.SenderEmail));

        message.To.Add(
            MailboxAddress.Parse(toEmail));

        message.Subject = subject;

        message.Body = new TextPart("html")
        {
            Text = body
        };

        using var smtpClient =
            new SmtpClient();

        var socketOptions =
            _settings.UseSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.Auto;

        await smtpClient.ConnectAsync(
            _settings.Host,
            _settings.Port,
            socketOptions,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(
                _settings.Username))
        {
            await smtpClient.AuthenticateAsync(
                _settings.Username,
                _settings.Password,
                cancellationToken);
        }

        await smtpClient.SendAsync(
            message,
            cancellationToken);

        await smtpClient.DisconnectAsync(
            true,
            cancellationToken);
    }
}