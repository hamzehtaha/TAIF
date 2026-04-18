namespace TAIF.Application.Exceptions
{
    /// <summary>
    /// Base exception for application-level business rule violations.
    /// </summary>
    public class AppException : Exception
    {
        public int StatusCode { get; }

        public AppException(string message, int statusCode = 400) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    /// <summary>
    /// Thrown when a requested resource is not found.
    /// Maps to HTTP 404.
    /// </summary>
    public class NotFoundException : AppException
    {
        public NotFoundException(string message) : base(message, 404) { }
        public NotFoundException(string entityName, Guid id) : base($"{entityName} with ID '{id}' was not found.", 404) { }
    }

    /// <summary>
    /// Thrown when a business rule is violated.
    /// Maps to HTTP 400 or 409 depending on context.
    /// </summary>
    public class BusinessRuleException : AppException
    {
        public BusinessRuleException(string message, int statusCode = 400) : base(message, statusCode) { }
    }

    /// <summary>
    /// Thrown when a duplicate entity or conflict is detected.
    /// Maps to HTTP 409.
    /// </summary>
    public class ConflictException : AppException
    {
        public ConflictException(string message) : base(message, 409) { }
    }

    /// <summary>
    /// Thrown when user is not authorized for an action.
    /// Maps to HTTP 403.
    /// </summary>
    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message = "You are not authorized to perform this action.") : base(message, 403) { }
    }
}
