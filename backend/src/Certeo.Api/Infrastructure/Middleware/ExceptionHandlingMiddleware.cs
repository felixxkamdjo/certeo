using System.Net;
using System.Text.Json;
using Certeo.Api.Common;

namespace Certeo.Api.Infrastructure.Middleware;

// Middleware to handle exceptions globally and return appropriate HTTP responses
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var (statusCode, message) = ex switch
            {
                DomainValidationException => (HttpStatusCode.BadRequest, ex.Message),
                DomainConflictException => (HttpStatusCode.Conflict, ex.Message),
                DomainNotFoundException => (HttpStatusCode.NotFound, ex.Message),
                _ => (HttpStatusCode.InternalServerError, "Une erreur inattendue est survenue."),
            };

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(ex, "Unhandled exception on {Path}", context.Request.Path);
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { message }));
        }
    }
}
