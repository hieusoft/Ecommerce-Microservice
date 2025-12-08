using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Provider.Polly;
using StackExchange.Redis;
using src.Middleware;
using src.Security;

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddJsonFile("ocelot.json");

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379"));
builder.Services.AddTransient<RedisTokenValidator>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddOcelot(builder.Configuration)
       .AddPolly()
       .AddDelegatingHandler<RedisTokenValidator>(false); 

var app = builder.Build();

app.UseCors();

app.UseMiddleware<RoleCheckMiddleware>();

app.MapGet("/", () => "API Gateway is running");

await app.UseOcelot();

app.Run();
