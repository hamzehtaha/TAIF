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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId })
                      .IsUnique();

                entity.HasOne(e => e.LastLessonItem)
                       .WithMany(li => li.Enrollments)
                       .HasForeignKey(e => e.LastLessonItemId)
                       .OnDelete(DeleteBehavior.Restrict);
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

            var guidCollectionConverter = new ValueConverter<ICollection<Guid>, string>(
                v => string.Join(",", v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v)
                        ? new List<Guid>()
                        : v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                           .Select(Guid.Parse)
                           .ToList()
            );

            var guidCollectionComparer = new ValueComparer<ICollection<Guid>>(
                (c1, c2) => c1.SequenceEqual(c2),             // How to compare two collections
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), // Hash code
                c => c.ToList()                                // How to make a snapshot
            );

            modelBuilder.Entity<Course>()
                .Property(e => e.Tags)
                .HasConversion(guidCollectionConverter)
                .Metadata.SetValueComparer(guidCollectionComparer);

            modelBuilder.Entity<User>()
                .Property(e => e.Interests)
                .HasConversion(guidCollectionConverter)
                .Metadata.SetValueComparer(guidCollectionComparer);

            // Recommendation entities configuration
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
        }

    }
}
