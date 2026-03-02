import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api/projects'
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
} from '@/types/project'

export function useProjects(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  status?: ProjectStatus
) {
  return useQuery({
    queryKey: ['projects', page, pageSize, search, status],
    queryFn: () => projectsApi.getAll(page, pageSize, search, status),
  })
}

export function useProject(id: number, userId?: number) {
  return useQuery({
    queryKey: ['project', id, userId],
    queryFn: () => projectsApi.getById(id, userId),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      projectsApi.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
