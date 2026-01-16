using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Response
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public T? Data { get; set; }
        public string? TraceId { get; set; }

        public ApiResponse(bool success, string message, T? data, string? traceId)
        {
            Success = success;
            Message = message;
            Data = data;
            TraceId = traceId;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful", string? traceId = null)
        {
            return new ApiResponse<T>(true, message, data, traceId);
        }

        public static ApiResponse<T> ErrorResponse(string message, string? traceId = null)
        {
            return new ApiResponse<T>(false, message, default, traceId);
        }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? TraceId { get; set; }
        public ApiResponse(bool success, string message, string? traceId)
        {
            Success = success;
            Message = message;
            TraceId = traceId;
        }
        public static ApiResponse SuccessResponse(string message = "Request successful", string? traceId = null)
        {
            return new ApiResponse(true, message, traceId);
        }
        public static ApiResponse ErrorResponse(string message, string? traceId = null)
        {
            return new ApiResponse(false, message, traceId);
        }
    }

}
