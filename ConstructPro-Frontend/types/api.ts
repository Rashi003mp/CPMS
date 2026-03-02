export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  traceId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}
