
using CouponService.Data;
using CouponService.Models;
using CouponService.Service;
using Microsoft.EntityFrameworkCore;

namespace CouponService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddDbContext<AppDbContext>(option => option.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSingleton<RabbitMqService>();

            var app = builder.Build();


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            var rabbit = app.Services.GetRequiredService<RabbitMqService>();

            rabbit.DeclareExchange("coupon_event", RabbitMQ.Client.ExchangeType.Direct);

            rabbit.DeclareQueueAndBind("coupon.create", "coupon_event", "coupon.create");
            rabbit.DeclareQueueAndBind("coupon.update", "coupon_event", "coupon.update");
            rabbit.DeclareQueueAndBind("coupon.delete", "coupon_event", "coupon.delete");

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
