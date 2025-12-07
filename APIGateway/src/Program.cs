using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Provider.Polly;
using src.Middleware;
using src.Security;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json");

// Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379"));

builder.Services.AddTransient<RedisTokenValidator>();

// ---- JWT ----
var key = Encoding.UTF8.GetBytes("YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!");

builder.Services.AddAuthentication()
    .AddJwtBearer("GatewayKey", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "AuthService",
            ValidAudience = "AuthServiceUsers",
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine("Auth failed: " + ctx.Exception.Message);
                return Task.CompletedTask;
            }
        };
    });

// ---- CORS ----
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // frontend của bạn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // cực kỳ quan trọng để gửi cookie
    });
});
// ---- OCELOT ----
builder.Services.AddOcelot(builder.Configuration).AddPolly();

var app = builder.Build();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RoleCheckMiddleware>();

app.MapGet("/", () => "API Gateway is running");

await app.UseOcelot();

app.Run();
