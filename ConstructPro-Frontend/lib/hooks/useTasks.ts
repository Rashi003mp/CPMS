import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

export function useTask(taskId: number) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  })
}

export function useProjectTasks(projectId: number) {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => tasksApi.getByProject(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', variables.projectId] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => tasksApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: number; reason?: string }) =>
      tasksApi.delete(taskId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
