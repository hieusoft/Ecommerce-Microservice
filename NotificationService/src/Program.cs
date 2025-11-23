using Microsoft.EntityFrameworkCore;
using src.Data;
using src.Interfaces;
using src.Repositories;
using src.Services;
using src.Workers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
// DbContextbuilder.Services.AddControllers();
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("NotificationDb")));

// OpenAPI
builder.Services.AddOpenApi();

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IUserNotificationRepository, UserNotificationRepository>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserNotificationService, UserNotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRabbitMqService, RabbitMqService>();

// Worker
builder.Services.AddSingleton<NotificationWorker>();

// **Thêm authorization**
builder.Services.AddAuthorization();

var app = builder.Build();

// OpenAPI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Chỉ dùng Authorization khi đã AddAuthorization
app.UseAuthorization();

app.MapControllers();

// Khởi động Worker
using (var scope = app.Services.CreateScope())
{
    var worker = scope.ServiceProvider.GetRequiredService<NotificationWorker>();
    worker.Start();
}

app.Run();
