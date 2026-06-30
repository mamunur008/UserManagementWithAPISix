namespace UserManagement.Application.Configuration;

public sealed class SessionOptions
{
    public int TtlMinutes { get; init; } = 120;
}
