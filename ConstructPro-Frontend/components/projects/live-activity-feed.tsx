'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { commentsApi } from '@/lib/api/comments'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { activityHub } from '@/lib/signalr/activityHub'
import { useAuthStore } from '@/store/authStore'
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface LiveActivityFeedProps {
  projectId: number
}

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: 'comment' | 'task_completed' | 'task_started' | 'task_created'
  taskId?: number
  comment?: string
}

export function LiveActivityFeed({ projectId }: LiveActivityFeedProps) {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [realtimeActivities, setRealtimeActivities] = useState<Activity[]>([])

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks', projectId.toString()],
    queryFn: () => tasksApi.getByProject(projectId),
    refetchInterval: 30000,
  })

  const tasks = tasksData || []

  // Fetch comments for all tasks
  const { data: allComments } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: async () => {
      if (!tasks || tasks.length === 0) return []
      
      const commentPromises = tasks.map(task =>
        commentsApi.getByTask(task.id).catch(() => ({ taskId: task.id, comments: [] }))
      )
      
      const commentsData = await Promise.all(commentPromises)
      return commentsData.flatMap(data => 
        data.comments.map(comment => ({
          ...comment,
          taskTitle: tasks.find(t => t.id === data.taskId)?.title || 'Unknown Task'
        }))
      )
    },
    enabled: tasks.length > 0,
    refetchInterval: 30000,
  })

  // Setup SignalR connection
  useEffect(() => {
    if (!token || !projectId) return

    const setupSignalR = async () => {
      try {
        await activityHub.connect(token)
        await activityHub.joinProjectGroup(projectId.toString())

        // Listen for new comments
        activityHub.onReceiveComment((data) => {
          console.log('📨 New comment received:', data)
          
          const newActivity: Activity = {
            id: `comment-${data.comment.id}-${Date.now()}`,
            user: data.comment.createdByUserName,
            action: 'commented on',
            target: data.taskTitle,
            time: data.comment.createdAt,
            type: 'comment',
            taskId: data.taskId,
            comment: data.comment.message
          }

          setRealtimeActivities(prev => [newActivity, ...prev].slice(0, 5))
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['comments', data.taskId] })
          queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] })
        })

      } catch (error) {
        console.error('SignalR setup error:', error)
      }
    }

    setupSignalR()

    return () => {
      activityHub.offReceiveComment()
      activityHub.leaveProjectGroup()
    }
  }, [token, projectId, queryClient])

  // Generate activities from tasks and comments
  const taskActivities: Activity[] = tasks
    .map(task => ({
      id: `task-${task.id}`,
      user: 'System',
      action: task.status === 3 ? 'completed' : task.status === 1 ? 'started work on' : 'created',
      target: task.title,
      time: task.modifiedAt || task.createdAt,
      type: (task.status === 3 ? 'task_completed' : task.status === 1 ? 'task_started' : 'task_created') as Activity['type'],
      taskId: task.id
    }))

  const commentActivities: Activity[] = (allComments || [])
    .map(comment => ({
      id: `comment-${comment.id}`,
      user: comment.createdByUserName,
      action: 'commented on',
      target: (comment as any).taskTitle,
      time: comment.createdAt,
      type: 'comment' as Activity['type'],
      taskId: comment.taskId,
      comment: comment.message
    }))

  // Combine all activities
  const allActivities = [...realtimeActivities, ...commentActivities, ...taskActivities]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10)

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4" />
      case 'task_completed':
        return <CheckCircle className="w-4 h-4" />
      case 'task_started':
        return <Clock className="w-4 h-4" />
      case 'task_created':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-600'
      case 'task_completed':
        return 'bg-green-100 text-green-600'
      case 'task_started':
        return 'bg-yellow-100 text-yellow-600'
      case 'task_created':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-600">
            LIVE ACTIVITY
          </CardTitle>
          <Badge className="bg-green-600 text-white">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No recent activity
          </div>
        ) : (
          allActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-600"> {activity.action} </span>
                  <span className="font-medium">{activity.target}</span>
                </div>
                {activity.comment && (
                  <div className="text-sm text-gray-600 mt-1 italic line-clamp-2">
                    "{activity.comment}"
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
