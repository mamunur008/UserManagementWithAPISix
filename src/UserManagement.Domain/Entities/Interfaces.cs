namespace UserManagement.Domain.Entities;

public interface IBigIntAudit
{
    long? CreatedAt { get; set; }
    long? UpdatedAt { get; set; }
    long? DeletedAt { get; set; }
    int? ServerVersion { get; set; }
    bool Voided { get; set; }
}

public static class EpochClock
{
    public static long Now() => DateTimeOffset.UtcNow.ToUnixTimeSeconds();
}
