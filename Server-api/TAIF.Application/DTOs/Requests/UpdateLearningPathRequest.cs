namespace TAIF.Application.DTOs.Requests;

public class UpdateLearningPathRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Photo { get; set; }
}

public class UpdateLearningPathSectionRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? Order { get; set; }
}

public class UpdateLearningPathCourseRequest
{
    public int? Order { get; set; }
    public bool? IsRequired { get; set; }
}
