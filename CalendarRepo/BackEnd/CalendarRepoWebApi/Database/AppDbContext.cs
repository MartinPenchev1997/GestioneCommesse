using CalendarRepo.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarRepo.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Utenti> Utenti { get; set; }
        public DbSet<Commessa> Commesse { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Utenti>().ToTable("Utenti");
            modelBuilder.Entity<Commessa>().Property(e => e.Date).HasColumnType("DATETIME2(0)");
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
