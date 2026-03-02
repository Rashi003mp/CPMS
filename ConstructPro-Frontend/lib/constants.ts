import { Role } from '@/types/user'
import { ProjectStatus } from '@/types/project'
import { TaskStatus } from '@/types/task'

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'Admin',
  [Role.ProjectManager]: 'Project Manager',
  [Role.SiteEngineer]: 'Site Engineer',
  [Role.Client]: 'Client',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planned]: 'Planned',
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.OnHold]: 'On Hold',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.Deleted]: 'Deleted',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planned]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.Active]: 'bg-green-100 text-green-800',
  [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.Completed]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.Deleted]: 'bg-red-100 text-red-800',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Blocked]: 'Blocked',
  [TaskStatus.Completed]: 'Completed',
  [TaskStatus.Cancelled]: 'Cancelled',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'bg-gray-100 text-gray-800',
  [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
  [TaskStatus.Blocked]: 'bg-red-100 text-red-800',
  [TaskStatus.Completed]: 'bg-green-100 text-green-800',
  [TaskStatus.Cancelled]: 'bg-gray-100 text-gray-800',
}

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ConstructPro'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api'
