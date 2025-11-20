using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using ApiGateway.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Load Ocelot
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot(builder.Configuration);

// Add Services (RabbitMQ, Logging, Health)
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add Middlewares
builder.Services.AddCustomMiddlewares();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
await app.UseOcelot();

app.Run();
