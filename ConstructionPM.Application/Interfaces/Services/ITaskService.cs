using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.TaskManager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface ITaskService
    {
        Task<ApiResponse<object>> CreateTaskAsync(
            CreateTaskDto dto,
            int currentUserId
        );

        Task<ApiResponse> UpdateTaskAsync(UpdateTaskDto dto);
        Task<ApiResponse> DeleteTaskAsync(int taskId, string? reason);
        Task<ApiResponse<TaskDto>> GetTaskByIdAsync(int taskId);
        Task<ApiResponse<List<TaskDto>>> GetTasksByProjectAsync(int projectId);
    }

}
