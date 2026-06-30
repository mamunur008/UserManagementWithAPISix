using System.Text.Json;

namespace UserManagement.Domain.Entities;

public sealed class SagaLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Operation { get; set; }
    public string? State { get; set; }
    public string? IdempotencyKey { get; set; }
    public string? TargetRef { get; set; }
    public JsonDocument? Payload { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public static SagaLog Start(string operation, string idempotencyKey, object payload) => new()
    {
        Operation = operation,
        State = SagaStates.Running,
        IdempotencyKey = idempotencyKey,
        Payload = JsonSerializer.SerializeToDocument(payload),
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow
    };
}

public static class SagaOperations
{
    public const string CreateUser = "CREATE_USER";
    public const string UpdateUser = "UPDATE_USER";
    public const string DeactivateUser = "DEACTIVATE_USER";
    public const string CreateRole = "CREATE_ROLE";
    public const string AssignRole = "ASSIGN_ROLE";
    public const string RemoveRole = "REMOVE_ROLE";
}

public static class SagaStates
{
    public const string Running = "RUNNING";
    public const string Committed = "COMMITTED";
    public const string Compensated = "COMPENSATED";
    public const string Aborted = "ABORTED";
}
