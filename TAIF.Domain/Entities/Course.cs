namespace TAIF.Domain.Entities
{
    public class Course
    {
        public int Id { get; set; } // Identity (1,1) by EF Core convention
        public string Name { get; set; } = null!;
    }
}
