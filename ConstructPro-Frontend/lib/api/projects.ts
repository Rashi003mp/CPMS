import apiClient from './axios'
import type {
  Project,
  PaginatedProjects,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
} from '@/types/project'
import type { ApiResponse } from '@/types/api'

export const projectsApi = {
  // Get all projects with pagination
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    status?: ProjectStatus
  ): Promise<PaginatedProjects> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    if (search) params.append('search', search)
    if (status !== undefined) params.append('status', status.toString())
    
    const response = await apiClient.get<ApiResponse<PaginatedProjects>>(
      `/projects?${params.toString()}`
    )
    return response.data.data!
  },

  // Get project by ID
  getById: async (id: number, userId?: number): Promise<Project> => {
    const params = userId ? `?userId=${userId}` : ''
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${id}${params}`
    )
    return response.data.data!
  },

  // Create new project
  create: async (data: CreateProjectRequest): Promise<number> => {
    // If image is provided, use FormData; otherwise use JSON
    if (data.image) {
      const formData = new FormData()
      formData.append('projectName', data.projectName)
      formData.append('description', data.description)
      formData.append('status', data.status.toString())
      formData.append('startDate', data.startDate)
      if (data.endDate) formData.append('endDate', data.endDate)
      formData.append('image', data.image)

      const response = await apiClient.post<ApiResponse<number>>(
        '/projects/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data.data!
    } else {
      const response = await apiClient.post<ApiResponse<number>>(
        '/projects/create',
        data
      )
      return response.data.data!
    }
  },

  // Update project
  update: async (id: number, data: UpdateProjectRequest): Promise<void> => {
    // If image is provided or removeImage is true, use FormData; otherwise use JSON
    if (data.image || data.removeImage) {
      const formData = new FormData()
      if (data.projectName) formData.append('projectName', data.projectName)
      if (data.description) formData.append('description', data.description)
      if (data.status !== undefined) formData.append('status', data.status.toString())
      if (data.startDate) formData.append('startDate', data.startDate)
      if (data.endDate) formData.append('endDate', data.endDate)
      if (data.remarks) formData.append('remarks', data.remarks)
      if (data.image) formData.append('image', data.image)
      if (data.removeImage) formData.append('removeImage', 'true')

      await apiClient.put<ApiResponse>(`/projects/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      await apiClient.put<ApiResponse>(`/projects/${id}`, data)
    }
  },

  // Delete project
  delete: async (id: number, reason: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/projects/${id}?reason=${encodeURIComponent(reason)}`)
  },
}
