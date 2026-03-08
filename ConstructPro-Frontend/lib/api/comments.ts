import apiClient from './axios'
import type { Comment, CreateCommentRequest, TaskCommentsResponse } from '@/types/comment'
import type { ApiResponse } from '@/types/api'

export const commentsApi = {
  // Get comments for a task
  getByTask: async (taskId: number): Promise<TaskCommentsResponse> => {
    const response = await apiClient.get<ApiResponse<TaskCommentsResponse>>(
      `/tasks/${taskId}/comments`
    )
    return response.data.data!
  },

  // Create comment
  create: async (taskId: number, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments`,
      data
    )
    return response.data.data!
  },

  // Delete comment
  delete: async (commentId: number): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/comments/${commentId}`)
  },
}
