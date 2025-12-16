using Microsoft.EntityFrameworkCore;
using src.Models;

namespace src.Data
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
            : base(options) { }

        public DbSet<DeliveryMethod> DeliveryMethods { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<NotificationDelivery> NotificationDelivery { get; set; } = null!;

        public DbSet<UserCache> UserCache { get; set; } = null!; 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<NotificationDelivery>()
                .HasOne(nd => nd.Notification)
                .WithMany(n => n.NotificationDeliveries)
                .HasForeignKey(nd => nd.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NotificationDelivery>()
                .HasOne(nd => nd.DeliveryMethod)
                .WithMany(dm => dm.NotificationDeliveries)
                .HasForeignKey(nd => nd.DeliveryMethodId)
                .OnDelete(DeleteBehavior.Restrict);

            
            modelBuilder.Entity<UserCache>(entity =>
            {
                entity.HasKey(u => u.UserId);

                entity.Property(u => u.Username)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(u => u.FullName)
                      .HasMaxLength(150);

                entity.Property(u => u.UpdatedAt)
                      .HasDefaultValueSql("GETDATE()");
            });
        }
    }
}
