namespace TAIF.Domain.Entities
{
    public class Organization : Base
    {
        public string Name { get; set; } = null!;
        public string? Logo { get; set; }
        public string? Description { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;

        // Navigation
        public ICollection<InstructorProfile> Instructors { get; set; } = new List<InstructorProfile>();
    }
}