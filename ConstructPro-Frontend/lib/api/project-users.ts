import apiClient from './axios'
import type { ApiResponse } from '@/types/api'

export interface AssignUserRequest {
  role: number // 1 = ProjectManager, 2 = SiteEngineer
  assignedUserId: number
  assignedUserName: string
}

export interface UnassignUserRequest {
  projectId: number
  userId: number
  roleId: number
  reason: string
}

export interface ReplaceUserRequest {
  projectId: number
  oldUserId: number
  newUserId: number
  roleId: number
  reason: string
}

export const projectUsersApi = {
  // Assign user to project
  assignUser: async (projectId: number, data: AssignUserRequest): Promise<void> => {
    await apiClient.post<ApiResponse>(
      `/ProjectUsers/${projectId}/assign-user`,
      data
    )
  },

  // Unassign user from project
  unassignUser: async (data: UnassignUserRequest): Promise<void> => {
    await apiClient.post<ApiResponse>('/ProjectUsers/unassign-user', data)
  },

  // Replace user in project
  replaceUser: async (data: ReplaceUserRequest): Promise<void> => {
    await apiClient.post<ApiResponse>('/ProjectUsers/replace-user', data)
  },
}
