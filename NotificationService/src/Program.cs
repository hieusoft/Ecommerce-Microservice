using Microsoft.EntityFrameworkCore;
using src.Data;
using src.Interfaces;
using src.Repositories;
using src.Services;
using src.Services.Messaging;
using src.Workers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("NotificationDb")));


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationDeliveryRepository, NotificationDeliveryRepository>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IWorkerService, WorkerService>();

builder.Services.AddScoped<NotificationWorker>();


builder.Services.AddAuthorization();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var rabbitMqService = scope.ServiceProvider.GetRequiredService<IRabbitMqService>();


    rabbitMqService.DeclareExchange("notification_events", RabbitMQ.Client.ExchangeType.Direct);

    rabbitMqService.DeclareQueueAndBind("notification.email_q", "notification_events", "notification.email");


}



if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();


var scope1 = app.Services.CreateScope();

var worker = scope1.ServiceProvider.GetRequiredService<NotificationWorker>();
worker.Start();


app.Run();
