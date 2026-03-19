import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { activityHub } from '@/lib/signalr/activityHub'
import { useAuthStore } from '@/store/authStore'

export function useRealtimeTasks(projectId?: number | number[]) {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token) return

    let mounted = true

    const setupSignalR = async () => {
      try {
        await activityHub.connect(token)
        
        if (projectId && mounted) {
          const projectIds = Array.isArray(projectId) ? projectId : [projectId];
          for (const pid of projectIds) {
            await activityHub.joinProjectGroup(pid.toString())
          }
        }

        // Listen for task updates
        if (mounted) {
            // Note: This relies on adding `onReceiveTaskUpdated` to activityHub.ts, which we will do next
            activityHub.onReceiveTaskUpdated((updatedTask) => {
              console.log('🔄 Task Updated via SignalR:', updatedTask)
              
              // Instead of full queries invalidation that might trigger loading states,
              // we invalidate specific queries so they refresh in the background
              if (updatedTask.projectId) {
                queryClient.invalidateQueries({ queryKey: ['project-tasks', updatedTask.projectId.toString()] })
                queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
                queryClient.invalidateQueries({ queryKey: ['tasks'] })
                queryClient.invalidateQueries({ queryKey: ['all-tasks'] })
              }
            })
        }
      } catch (error) {
        console.error('SignalR setup error:', error)
      }
    }

    setupSignalR()

    return () => {
      mounted = false
      activityHub.offReceiveTaskUpdated()
      if (projectId) {
        activityHub.leaveProjectGroup()
      }
    }
  }, [token, projectId, queryClient])
}
