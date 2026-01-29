using Microsoft.EntityFrameworkCore;
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
        }

    }
}
