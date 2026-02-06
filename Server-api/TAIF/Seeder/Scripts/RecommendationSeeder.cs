using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Recommendation
    public class RecommendationSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public RecommendationSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            string seedName = "Recommendation";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var seedData = JsonSerializer.Deserialize<RecommendationSeedData>(json, options)
                       ?? throw new InvalidOperationException("Invalid seed JSON");

            // Seed Interests
            var interestIdMap = new Dictionary<string, Guid>();
            foreach (var interestName in seedData.Interests)
            {
                var existing = _context.Interests.FirstOrDefault(i => i.Name == interestName);
                if (existing == null)
                {
                    var interest = new Interest { Name = interestName };
                    _context.Interests.Add(interest);
                    await _context.SaveChangesAsync();
                    interestIdMap[interestName] = interest.Id;
                    Console.WriteLine($"✅ Interest '{interestName}' created");
                }
                else
                {
                    interestIdMap[interestName] = existing.Id;
                }
            }

            // Seed Tags
            var tagIdMap = new Dictionary<string, Guid>();
            foreach (var tagName in seedData.Tags)
            {
                var existing = _context.Tags.FirstOrDefault(t => t.Name == tagName);
                if (existing == null)
                {
                    var tag = new Tag { Name = tagName };
                    _context.Tags.Add(tag);
                    await _context.SaveChangesAsync();
                    tagIdMap[tagName] = tag.Id;
                    Console.WriteLine($"✅ Tag '{tagName}' created");
                }
                else
                {
                    tagIdMap[tagName] = existing.Id;
                }
            }

            // Seed InterestTagMappings
            foreach (var mapping in seedData.Mappings)
            {
                if (!interestIdMap.TryGetValue(mapping.Interest, out var interestId))
                {
                    Console.WriteLine($"⚠️ Interest '{mapping.Interest}' not found, skipping mapping");
                    continue;
                }
                if (!tagIdMap.TryGetValue(mapping.Tag, out var tagId))
                {
                    Console.WriteLine($"⚠️ Tag '{mapping.Tag}' not found, skipping mapping");
                    continue;
                }

                var existing = _context.InterestTagMappings
                    .FirstOrDefault(m => m.InterestId == interestId && m.TagId == tagId);
                
                if (existing == null)
                {
                    var newMapping = new InterestTagMapping
                    {
                        InterestId = interestId,
                        TagId = tagId,
                        Weight = mapping.Weight
                    };
                    _context.InterestTagMappings.Add(newMapping);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ Mapping '{mapping.Interest}' -> '{mapping.Tag}' (weight: {mapping.Weight}) created");
                }
            }

            Console.WriteLine("✅ All interests, tags, and mappings seeded successfully");
        }

        private class RecommendationSeedData
        {
            public List<string> Interests { get; set; } = new();
            public List<string> Tags { get; set; } = new();
            public List<MappingJson> Mappings { get; set; } = new();
        }

        private class MappingJson
        {
            public string Interest { get; set; } = null!;
            public string Tag { get; set; } = null!;
            public double Weight { get; set; } = 0.5;
        }
    }
}
