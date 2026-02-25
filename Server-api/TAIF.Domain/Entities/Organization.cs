namespace TAIF.Domain.Entities
{
    public class Organization : Base
    {
        public string Name { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string? Identity { get; set; }
        public OrganizationType Type { get; set; } = OrganizationType.Public;
        public string? Logo { get; set; }
        public string? Description { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Settings { get; set; }

        // Navigation
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Instructor> Instructors { get; set; } = new List<Instructor>();
    }
}