using Microsoft.EntityFrameworkCore;
using src.Data;
using src.Interfaces;
using src.Repositories;
using src.Services;
using src.Services.Messaging;
using src.Workers;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8087);
});

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("NotificationDb")
    )
);

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationDeliveryRepository, NotificationDeliveryRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IWorkerService, WorkerService>();
builder.Services.AddScoped<IUserCacheRepository, UserCacheRepository>();

builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();


builder.Services.AddHostedService<NotificationWorker>();


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var rabbitMqService = scope.ServiceProvider
        .GetRequiredService<IRabbitMqService>();

    rabbitMqService.DeclareExchange(
        "notification_events",
        RabbitMQ.Client.ExchangeType.Direct
    );

    rabbitMqService.DeclareQueueAndBind(
        "notification.email_q",
        "notification_events",
        "notification.email"
    );
}


app.UseSwagger();
app.UseSwaggerUI();


app.MapControllers();


app.Run();
