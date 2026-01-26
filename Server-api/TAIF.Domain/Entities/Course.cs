using System;

namespace TAIF.Domain.Entities
{
    public class Course : Base
    {
        public string? Name { get; set; } = null;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}
