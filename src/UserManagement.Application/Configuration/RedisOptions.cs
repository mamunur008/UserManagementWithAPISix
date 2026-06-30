namespace UserManagement.Application.Configuration;

public sealed class RedisOptions
{
    public string ConnectionString { get; init; } = "localhost:6379";
}
