namespace TAIF.Application.DTOs.Verification;

/// <summary>
/// Channel-agnostic delivery contract.
/// Email channels use Subject + HTML Body.
/// SMS/WhatsApp channels use plain-text Body only.
/// </summary>
public record VerificationMessage(
    string Recipient,       // email address OR phone number
    string Body,            // HTML for email, plain text for SMS/WhatsApp
    string? Subject = null  // only used by email channels
);
