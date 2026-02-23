namespace TAIF.Domain.Entities
{
    public class Category : OrganizationBase
    {
        public string Name { get; set; } = null!;
        ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}
