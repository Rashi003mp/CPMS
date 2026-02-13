using System;

namespace ConstructionPM.Application.DTOs.Response
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public string? TraceId { get; set; }
        public int StatusCode { get; set; }  // ✅ Added

        public ApiResponse(bool success, string message, T? data, int statusCode, string? traceId = null)
        {
            Success = success;
            Message = message;
            Data = data;
            StatusCode = statusCode;
            TraceId = traceId;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful", int statusCode = 200, string? traceId = null)
        {
            return new ApiResponse<T>(true, message, data, statusCode, traceId);
        }

        public static ApiResponse<T> ErrorResponse(string message, int statusCode = 400, string? traceId = null)
        {
            return new ApiResponse<T>(false, message, default, statusCode, traceId);
        }

        // Common HTTP status codes for convenience
        public static ApiResponse<T> NotFound(string message = "Resource not found", string? traceId = null)
        {
            return ErrorResponse(message, 404, traceId);
        }

        public static ApiResponse<T> Unauthorized(string message = "Unauthorized access", string? traceId = null)
        {
            return ErrorResponse(message, 401, traceId);
        }

        public static ApiResponse<T> Forbidden(string message = "Access forbidden", string? traceId = null)
        {
            return ErrorResponse(message, 403, traceId);
        }
    }

    public class ApiResponse  // Non-generic version
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TraceId { get; set; }
        public int StatusCode { get; set; }  // ✅ Added

        public ApiResponse(bool success, string message, int statusCode, string? traceId = null)
        {
            Success = success;
            Message = message;
            StatusCode = statusCode;
            TraceId = traceId;
        }

        public static ApiResponse SuccessResponse(string message = "Request successful", int statusCode = 200, string? traceId = null)
        {
            return new ApiResponse(true, message, statusCode, traceId);
        }

        public static ApiResponse ErrorResponse(string message, int statusCode = 400, string? traceId = null)
        {
            return new ApiResponse(false, message, statusCode, traceId);
        }

        public static ApiResponse NotFound(string message = "Resource not found", string? traceId = null)
        {
            return ErrorResponse(message, 404, traceId);
        }

        public static ApiResponse Unauthorized(string message = "Unauthorized access", string? traceId = null)
        {
            return ErrorResponse(message, 401, traceId);
        }

        public static ApiResponse Forbidden(string message = "Access forbidden", string? traceId = null)
        {
            return ErrorResponse(message, 403, traceId);
        }
    }
}
