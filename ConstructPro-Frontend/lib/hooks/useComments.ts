import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '../api/comments'
import type { CreateCommentRequest } from '@/types/comment'

export function useComments(taskId: number) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentsApi.getByTask(taskId),
    enabled: !!taskId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: CreateCommentRequest }) =>
      commentsApi.create(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}
