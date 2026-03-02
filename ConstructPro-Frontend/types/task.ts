export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Blocked = 2,
  Completed = 3,
  Cancelled = 4,
}

export interface Task {
  id: number
  projectId: number
  title: string
  description?: string
  assignedToUserId: number
  dueDate: string
  status: TaskStatus
  createdAt: string
  modifiedAt?: string
}

export interface CreateTaskRequest {
  projectId: number
  title: string
  description?: string
  assignedToUserId: number
  dueDate: string
  status: TaskStatus
}

export interface UpdateTaskRequest {
  taskId: number
  projectId: number
  title?: string
  description?: string
  assignedToUserId?: number
  dueDate?: string
  status?: TaskStatus
}
