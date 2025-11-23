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
        public DbSet<UserNotification> UserNotifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserNotification>()
                .HasOne(un => un.Notification)
                .WithMany(n => n.UserNotifications)
                .HasForeignKey(un => un.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserNotification>()
                .HasOne(un => un.DeliveryMethod)
                .WithMany(dm => dm.UserNotifications)
                .HasForeignKey(un => un.DeliveryMethodId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
