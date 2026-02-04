namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Represents a high-level interest category (e.g., Web Development, Mobile Development, Data Science).
    /// These are broad topics that students can have varying levels of interest in.
    /// </summary>
    public class Interest : Base
    {
        public string Name { get; set; } = null!;
        
        public ICollection<InterestTagMapping> TagMappings { get; set; } = new List<InterestTagMapping>();
    }
}
