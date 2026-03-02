import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export function usePendingRegistrations() {
  return useQuery({
    queryKey: ['pending-registrations'],
    queryFn: () => usersApi.getPendingRegistrations(),
  })
}

export function useApproveRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.approveRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useRejectRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      usersApi.rejectRegistration(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-registrations'] })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
