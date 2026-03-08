using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class CreateQuestionRequest
{
    [Required(ErrorMessage = "Question info is required.")]
    [StringLength(2000, MinimumLength = 2, ErrorMessage = "Info must be between 2 and 2000 characters.")]
    public string Info { get; set; } = string.Empty;

    [Required(ErrorMessage = "Question goals are required.")]
    [StringLength(2000, MinimumLength = 2, ErrorMessage = "Goals must be between 2 and 2000 characters.")]
    public string Goals { get; set; } = string.Empty;

    public List<Guid>? AnswerIds { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Correct answer index must be zero or positive.")]
    public int CorrectAnswerIndex { get; set; }

    [Range(0, 100, ErrorMessage = "Min percentage must be between 0 and 100.")]
    public int MinPercentage { get; set; } = 100;

    public List<Guid>? SkillIds { get; set; }
}

public class UpdateQuestionRequest
{
    [StringLength(2000, MinimumLength = 2, ErrorMessage = "Info must be between 2 and 2000 characters.")]
    public string? Info { get; set; }

    [StringLength(2000, MinimumLength = 2, ErrorMessage = "Goals must be between 2 and 2000 characters.")]
    public string? Goals { get; set; }

    public List<Guid>? AnswerIds { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Correct answer index must be zero or positive.")]
    public int? CorrectAnswerIndex { get; set; }

    [Range(0, 100, ErrorMessage = "Min percentage must be between 0 and 100.")]
    public int? MinPercentage { get; set; }

    public List<Guid>? SkillIds { get; set; }
}
