using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Exception;
using System.Net;
using System.Text.Json;

namespace ConstructionPM.API.Middleware
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlerMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlerMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlerMiddleware> logger,
            IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception,
                    "Exception Type: {Type} | Message: {Message}",
                    exception.GetType().Name,
                    exception.Message);
                await HandleExceptionAsync(context, exception);
            }
        }

        private  Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                // Business / Domain exceptions
                BusinessException => (HttpStatusCode.BadRequest, exception.Message),

                // Application / infrastructure errors
                ApplicationFailureException => (
                    HttpStatusCode.InternalServerError,
                    _env.IsDevelopment()
                        ? exception.Message
                        : "An internal server error occurred"
                ),

                // Validation exceptions
                ArgumentNullException => (HttpStatusCode.BadRequest, $"Invalid input: {exception.Message}"),

                ArgumentException => (HttpStatusCode.BadRequest, exception.Message),

                // Authentication / Authorization exceptions
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized access"),

                //  not found exceptions
                KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),

                // Other exceptions
                InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
                _ => (HttpStatusCode.InternalServerError, "An internal server error occurred")
            };

            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse.ErrorResponse(message,context.TraceIdentifier);
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            
            return context.Response.WriteAsJsonAsync(response, options);
        }
    }
}