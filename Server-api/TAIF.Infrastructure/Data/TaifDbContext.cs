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
                      .WithOne()
                      .HasForeignKey<InstructorProfile>(ip => ip.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ip => ip.Organization)
                      .WithMany(o => o.Instructors)
                      .HasForeignKey(ip => ip.OrganizationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(ip => ip.UserId).IsUnique();
            });

            // Organization configuration
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.HasIndex(o => o.Name).IsUnique();
            });

            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId })
                      .IsUnique();
            });

            modelBuilder.Entity<LessonItemProgress>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.LessonItemId })
                      .IsUnique();
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId })
                      .IsUnique();

                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Course)
                      .WithMany()
                      .HasForeignKey(r => r.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(r => r.Rating)
                      .IsRequired();

                entity.Property(r => r.Comment)
                      .HasMaxLength(2000);
            });

            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasOne(c => c.Creator)
                      .WithMany(u => u.CreatedCourses)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

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

            modelBuilder.Entity<Interest>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<InterestTagMapping>(entity =>
            {
                entity.HasIndex(e => new { e.InterestId, e.TagId }).IsUnique();
            });

            modelBuilder.Entity<UserCourseBehavior>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
                entity.HasIndex(e => e.UserId);
            });

            modelBuilder.Entity<QuizSubmission>()
            .HasIndex(x => new { x.UserId, x.LessonItemId })
            .IsUnique();
        }
    }
}
