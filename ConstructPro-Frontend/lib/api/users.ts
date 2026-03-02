import apiClient from './axios'
import type { User } from '@/types/user'
import type { ApiResponse } from '@/types/api'

export interface UserListItem {
  userId: number
  userName: string
  email: string
  activeProjectCount: number
  roleName?: string
  isActive: boolean
}

export interface PendingRegistration {
  id: number
  name: string
  email: string
  phoneNumber: string
  roleName: string
  experienceYears?: number
  skills?: string
  projectName?: string
  requestedAt: string
}

export const usersApi = {
  // Get all users (Admin only)
  getAll: async (): Promise<UserListItem[]> => {
    const response = await apiClient.get<ApiResponse<UserListItem[]>>(
      '/User/GetAllUsers'
    )
    return response.data.data!
  },

  // Get user by ID
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      `/User/GetUserById/${id}`
    )
    return response.data.data!
  },

  // Deactivate user (Admin only)
  deactivate: async (id: number): Promise<void> => {
    await apiClient.patch<ApiResponse>(`/User/Deactivate/${id}`)
  },

  // Activate user (Admin only)
  activate: async (id: number): Promise<void> => {
    await apiClient.patch<ApiResponse>(`/User/Activate/${id}`)
  },

  // Get pending registrations (Admin/PM only)
  getPendingRegistrations: async (): Promise<PendingRegistration[]> => {
    const response = await apiClient.get<ApiResponse<PendingRegistration[]>>(
      '/Registration/requests/pending'
    )
    return response.data.data!
  },

  // Approve registration (Admin/PM only)
  approveRegistration: async (id: number): Promise<void> => {
    await apiClient.post<ApiResponse>(`/Registration/requests/${id}/approve`)
  },

  // Reject registration (Admin/PM only)
  rejectRegistration: async (id: number, reason: string): Promise<void> => {
    await apiClient.post<ApiResponse>(
      `/Registration/requests/${id}/reject?rejectionReason=${encodeURIComponent(reason)}`
    )
  },
}
