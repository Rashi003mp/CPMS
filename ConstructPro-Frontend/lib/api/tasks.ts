import apiClient from './axios'
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types/task'
import type { ApiResponse } from '@/types/api'

export const tasksApi = {
  // Create new task
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      '/CreateTask',
      data
    )
    return response.data.data!
  },

  // Update task
  update: async (data: UpdateTaskRequest): Promise<void> => {
    await apiClient.put<ApiResponse>('/CreateTask/update', data)
  },

  // Delete task
  delete: async (taskId: number, reason?: string): Promise<void> => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    await apiClient.delete<ApiResponse>(`/CreateTask/delete/${taskId}${params}`)
  },

  // Get task by ID
  getById: async (taskId: number): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(
      `/CreateTask/${taskId}`
    )
    return response.data.data!
  },

  // Get all tasks for a project
  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/CreateTask/project/${projectId}`
    )
    return response.data.data!
  },
}
