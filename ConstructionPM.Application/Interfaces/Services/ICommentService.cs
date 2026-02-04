using ConstructionPM.Application.DTOs.Comments;
using ConstructionPM.Application.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface ICommentService
    {
        Task<ApiResponse<CommentResponseDto>> CreateAsync(CreateCommentInternalDto dto, string? traceId);

        Task<ApiResponse<TaskCommentsResponseDto>> GetByTaskAsync(
            int taskId,
            int requestingUserId,
            string? traceId,
            string role);

        Task<ApiResponse> DeleteAsync(
            int commentId,
            int requestingUserId,
            string? traceId);
    }


}
