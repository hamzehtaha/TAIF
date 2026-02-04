namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Represents a mid-level tag that describes course content (e.g., JavaScript, React, Node.js).
    /// Tags are more specific than interests and map to courses directly.
    /// </summary>
    public class Tag : Base
    {
        public string Name { get; set; } = null!;
        
        public ICollection<InterestTagMapping> InterestMappings { get; set; } = new List<InterestTagMapping>();
    }
}
