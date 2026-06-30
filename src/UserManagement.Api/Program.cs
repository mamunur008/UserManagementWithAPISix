using UserManagement.Application;
using UserManagement.Infrastructure;
using UserManagement.Api.Middleware;
using UserManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader().AllowCredentials()));
var app = builder.Build();
app.UseMiddleware<ErrorEnvelopeMiddleware>();
app.UseCors(); app.UseSwagger(); app.UseSwaggerUI(); app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status="ok", service="UserManagement.Api" }));
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserManagementDbContext>();
    db.Database.EnsureCreated();
}
app.Run();
