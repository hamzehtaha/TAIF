namespace TAIF.Domain.Entities
{
    public class Category : Base
    {
        public string Name { get; set; } = null!;
        ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}
