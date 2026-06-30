using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Infrastructure.Keycloak;
using UserManagement.Infrastructure.Persistence;
using UserManagement.Infrastructure.Persistence.Repositories;
using UserManagement.Infrastructure.Redis;
using UserManagement.Infrastructure.Services;

namespace UserManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<KeycloakOptions>(configuration.GetSection("Keycloak")); services.Configure<RedisOptions>(configuration.GetSection("Redis")); services.Configure<SessionOptions>(configuration.GetSection("Session"));
        services.AddDbContext<UserManagementDbContext>(o => o.UseNpgsql(configuration.GetConnectionString("UserManagementDb")));
        services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(configuration.GetSection("Redis").Get<RedisOptions>()?.ConnectionString ?? "localhost:6379"));
        services.AddScoped<ISessionStore, RedisSessionStore>(); services.AddHttpClient<IKeycloakAdminClient, KeycloakAdminClient>(); services.AddHttpClient<IKeycloakAuthClient, KeycloakAuthClient>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>(); services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();
        services.AddScoped<IUserService, UserService>(); services.AddScoped<IRoleService, RoleService>(); services.AddScoped<IPermissionService, PermissionService>(); services.AddScoped<IRolePermissionService, RolePermissionService>(); services.AddScoped<IMenuService, MenuService>(); services.AddScoped<IOrganizationService, OrganizationService>(); services.AddScoped<IPaymentAccountService, PaymentAccountService>();
        services.AddScoped<IMeService, MeService>();
        services.AddScoped<IOrganizationTypeService, OrganizationTypeService>();
        services.AddScoped<IChartOfAccountService, ChartOfAccountService>();
        return services;
    }
}
