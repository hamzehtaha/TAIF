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
        public DbSet<User> Users => Set<User>();

        public DbSet<Category> Categories { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Lesson> lessons { get; set; }
        public DbSet<LessonItem> LessonItems { get; set; }
    }
}
