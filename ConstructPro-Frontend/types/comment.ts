export interface Comment {
  id: number
  taskId: number
  commentText: string
  createdBy: number
  createdByName?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateCommentRequest {
  commentText: string
}

export interface TaskCommentsResponse {
  taskId: number
  comments: Comment[]
}
