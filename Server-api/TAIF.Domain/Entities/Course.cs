namespace TAIF.Domain.Entities
{
    public class Course : Base
    {
        public string? Name { get; set; } = null;
        public string? Description { get; set; }
        public string? Photo { get; set; }
    }
}
