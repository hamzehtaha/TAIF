namespace TAIF.API.Seeder
{
    /// <summary>
    /// Production = required for the system to operate (runs via: dotnet run -- seed prod)
    /// Test       = demo / test data only            (runs via: dotnet run -- seed test)
    /// </summary>
    public enum SeedCategory
    {
        Production,
        Test
    }

    public interface IEntitySeeder
    {
        /// <summary>Identifies whether this seeder is required for production or is test/demo data.</summary>
        SeedCategory Category { get; }

        Task SeedAsync();
    }
}
