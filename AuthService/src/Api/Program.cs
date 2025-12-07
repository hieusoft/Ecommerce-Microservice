using Api.Middleware;
using Api.Security;
using Application.Interfaces;
using Application.UseCases;
using AspNetCoreRateLimit;
using Infrastructure.DbContext;
using Infrastructure.Repositories;
using Infrastructure.Security;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8081);
});
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")));


builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth Service API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // domain frontend c?a b?n
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<ITokenRepository, TokenRepository>();
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
// Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Use Cases
builder.Services.AddScoped<AuthUseCases>();
builder.Services.AddScoped<UserUseCases>();


builder.Services.AddScoped<JwtTokenValidator>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var validator = context.HttpContext.RequestServices.GetRequiredService<JwtTokenValidator>();
                await validator.ValidateAsync(context);
            },
            OnChallenge = async context =>
            {
                context.HandleResponse(); 
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "Unauthorized: invalid token" });
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "Forbidden: you do not have access" });
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddMemoryCache();

builder.Services.Configure<IpRateLimitOptions>(
    builder.Configuration.GetSection("IpRateLimiting"));

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();
builder.Services.AddSingleton<IRedisService, RedisService>();

builder.Services.AddInMemoryRateLimiting();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var rabbitMqService = scope.ServiceProvider.GetRequiredService<IRabbitMqService>();

 
    rabbitMqService.DeclareExchange("auth_events", RabbitMQ.Client.ExchangeType.Direct);

    rabbitMqService.DeclareQueueAndBind("email.verification_requested_q", "auth_events", "email.verification_requested");
    rabbitMqService.DeclareQueueAndBind("email.verified_q", "auth_events", "email.verified");
    rabbitMqService.DeclareQueueAndBind("password.reset_requested_q", "auth_events", "password.reset_requested");
    rabbitMqService.DeclareQueueAndBind("password.reset_completed_q", "auth_events", "password.reset_completed");

    rabbitMqService.DeclareQueueAndBind("notification.user_registered_q", "auth_events", "user.registered");
    rabbitMqService.DeclareQueueAndBind("notification.user_banned_q", "auth_events", "user.banned");
    rabbitMqService.DeclareQueueAndBind("notification.user_unbanned_q", "auth_events", "user.unbanned");

}


app.UseIpRateLimiting();

//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}
app.UseCors("AllowFrontend");
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseMiddleware<CheckBannedMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
