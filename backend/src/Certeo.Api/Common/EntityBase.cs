namespace Certeo.Api.Common;

// Base class for all entities in the system, providing a unique identifier (Id) for each entity.
// This becomes the primary key "uuid" on the PostgreSQL side once the EF Core migration is generated.
public abstract class EntityBase
{
    public Guid Id { get; set; } = Guid.NewGuid();
}
