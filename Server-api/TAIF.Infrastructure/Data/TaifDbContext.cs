using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Infrastructure.Data
{
    public class TaifDbContext : DbContext
    {
        public TaifDbContext(DbContextOptions<TaifDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<InstructorProfile> InstructorProfiles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Lesson> lessons { get; set; }
        public DbSet<LessonItem> LessonItems { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<LessonItemProgress> LessonItemProgress { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Interest> Interests { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<InterestTagMapping> InterestTagMappings { get; set; }
        public DbSet<UserCourseBehavior> UserCourseBehaviors { get; set; }
        public DbSet<QuizSubmission> QuizSubmissions => Set<QuizSubmission>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // InstructorProfile configuration
            modelBuilder.Entity<InstructorProfile>(entity =>
            {
                entity.HasOne(ip => ip.User)
                      .WithOne(u => u.InstructorProfile)
                      .HasForeignKey<InstructorProfile>(ip => ip.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ip => ip.Organization)
                      .WithMany(o => o.Instructors)
                      .HasForeignKey(ip => ip.OrganizationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(ip => ip.UserId).IsUnique();

                entity.Property(ip => ip.Rating)
                      .HasPrecision(5, 2);

                entity.Property(ip => ip.Expertises)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                      );
            });

            // Organization configuration
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.HasIndex(o => o.Name).IsUnique();
                entity.HasIndex(o => o.Slug).IsUnique();
                entity.HasIndex(o => o.Identity).IsUnique();
                entity.HasIndex(o => o.Type);
            });

            // User-Organization configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.OrganizationId);
                entity.HasIndex(u => u.Role);
                entity.HasIndex(u => new { u.OrganizationId, u.Role, u.IsActive });

                entity.HasOne(u => u.Organization)
                      .WithMany(o => o.Users)
                      .HasForeignKey(u => u.OrganizationId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Course configuration
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasOne(c => c.Creator)
                      .WithMany(u => u.CreatedCourses)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Category)
                      .WithMany()
                      .HasForeignKey(c => c.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Organization)
                      .WithMany()
                      .HasForeignKey(c => c.OrganizationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(c => c.OrganizationId);
                entity.HasIndex(c => new { c.OrganizationId, c.UserId });
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasOne(c => c.Organization)
                      .WithMany()
                      .HasForeignKey(c => c.OrganizationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(c => c.OrganizationId);
            });

            // Lesson configuration
            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.HasOne(l => l.Course)
                      .WithMany()
                      .HasForeignKey(l => l.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // LessonItem configuration
            modelBuilder.Entity<LessonItem>(entity =>
            {
                entity.HasOne(li => li.Lesson)
                      .WithMany()
                      .HasForeignKey(li => li.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Enrollment configuration
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId })
                      .IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict); // Change to Restrict

                entity.HasOne(e => e.Course)
                      .WithMany()
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);

            });

            // LessonItemProgress configuration
            modelBuilder.Entity<LessonItemProgress>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.LessonItemId })
                      .IsUnique();

                entity.HasOne(lip => lip.User)
                      .WithMany()
                      .HasForeignKey(lip => lip.UserId)
                      .OnDelete(DeleteBehavior.Restrict); // Change to Restrict

                entity.HasOne(lip => lip.LessonItem)
                      .WithMany()
                      .HasForeignKey(lip => lip.LessonItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Review configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId })
                      .IsUnique();

                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Course)
                      .WithMany()
                      .HasForeignKey(r => r.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(r => r.Rating)
                      .HasPrecision(5, 2);
            });

            // UserCourseBehavior configuration
            modelBuilder.Entity<UserCourseBehavior>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
                entity.HasIndex(e => e.UserId);

                entity.HasOne(ucb => ucb.User)
                      .WithMany()
                      .HasForeignKey(ucb => ucb.UserId)
                      .OnDelete(DeleteBehavior.Restrict); // Change to Restrict

                entity.HasOne(ucb => ucb.Course)
                      .WithMany()
                      .HasForeignKey(ucb => ucb.CourseId)
                      .OnDelete(DeleteBehavior.Cascade); // Keep Cascade
            });

            // QuizSubmission configuration - FIXED: No User navigation property
            modelBuilder.Entity<QuizSubmission>(entity =>
            {
                entity.HasIndex(x => new { x.UserId, x.LessonItemId })
                      .IsUnique();

                entity.HasOne(qs => qs.LessonItem)
                      .WithMany()
                      .HasForeignKey(qs => qs.LessonItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Interest configuration
            modelBuilder.Entity<Interest>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Tag configuration
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // InterestTagMapping configuration
            modelBuilder.Entity<InterestTagMapping>(entity =>
            {
                entity.HasIndex(e => new { e.InterestId, e.TagId }).IsUnique();

                entity.HasOne(itm => itm.Interest)
                      .WithMany()
                      .HasForeignKey(itm => itm.InterestId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(itm => itm.Tag)
                      .WithMany()
                      .HasForeignKey(itm => itm.TagId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Value converters
            var guidCollectionConverter = new ValueConverter<ICollection<Guid>, string>(
                v => string.Join(",", v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v)
                        ? new List<Guid>()
                        : v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                           .Select(Guid.Parse)
                           .ToList()
            );

            var guidCollectionComparer = new ValueComparer<ICollection<Guid>>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList()
            );

            modelBuilder.Entity<Course>()
                .Property(e => e.Tags)
                .HasConversion(guidCollectionConverter)
                .Metadata.SetValueComparer(guidCollectionComparer);

            modelBuilder.Entity<User>()
                .Property(e => e.Interests)
                .HasConversion(guidCollectionConverter)
                .Metadata.SetValueComparer(guidCollectionComparer);
        }
    }
}
