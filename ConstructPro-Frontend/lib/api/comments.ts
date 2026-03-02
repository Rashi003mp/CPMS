import apiClient from './axios'
import type { Comment, CreateCommentRequest, TaskCommentsResponse } from '@/types/comment'
import type { ApiResponse } from '@/types/api'

export const commentsApi = {
  // Get comments for a task
  getByTask: async (taskId: number): Promise<Comment[]> => {
    const response = await apiClient.get<ApiResponse<TaskCommentsResponse>>(
      `/comments/tasks/${taskId}/comments`
    )
    return response.data.data?.comments || []
  },

  // Create comment
  create: async (taskId: number, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/comments/tasks/${taskId}/comments`,
      data
    )
    return response.data.data!
  },

  // Delete comment (if endpoint exists)
  delete: async (taskId: number, commentId: number): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/comments/tasks/${taskId}/comments/${commentId}`)
  },
}
