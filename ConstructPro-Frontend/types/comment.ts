export interface Comment {
  id: number
  taskId: number
  message: string
  createdByUserId: number
  createdByUserName: string
  createdAt: string
}

export interface CreateCommentRequest {
  message: string
}

export interface TaskCommentsResponse {
  taskId: number
  comments: Comment[]
}
