using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Validation
{
    /// <summary>
    /// Validates that a Guid field is not Guid.Empty.
    /// [Required] alone does not catch Guid.Empty on non-nullable Guid fields.
    /// </summary>
    public class NonEmptyGuidAttribute : ValidationAttribute
    {
        public NonEmptyGuidAttribute()
            : base("The {0} field must not be an empty GUID.") { }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is Guid guid && guid == Guid.Empty)
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));

            return ValidationResult.Success;
        }
    }
}