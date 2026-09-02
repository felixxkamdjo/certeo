namespace Certeo.Api.Common;

// for 400 Bad Request responses when a business rule is violated (e.g., invalid input data)
public sealed class DomainValidationException : Exception
{
    public DomainValidationException(string message) : base(message) { }
}

// for 409 Conflict responses when a business rule is violated (e.g., trying to create a duplicate entity)
public sealed class DomainConflictException : Exception
{
    public DomainConflictException(string message) : base(message) { }
}

// for 404 Not Found responses when a requested entity does not exist
public sealed class DomainNotFoundException : Exception
{
    public DomainNotFoundException(string message) : base(message) { }
}
