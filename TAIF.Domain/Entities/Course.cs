using System;
using TAIF.Domain.Entities;

namespace TAIF.Domain.Entities
{
    public class Course : Base
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
    }
}