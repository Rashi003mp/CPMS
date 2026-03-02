'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { formatDistanceToNow } from 'date-fns'

interface LiveActivityFeedProps {
  projectId: number
}

export function LiveActivityFeed({ projectId }: LiveActivityFeedProps) {
  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks', projectId.toString()],
    queryFn: () => tasksApi.getByProject(projectId),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const tasks = tasksData?.data || []

  // Generate activity items from tasks
  const activities = tasks
    .map(task => ({
      id: task.id,
      user: 'System',
      action: task.status === 3 ? 'completed' : task.status === 1 ? 'started' : 'created',
      target: task.title,
      time: task.modifiedAt || task.createdAt,
      type: task.status === 3 ? 'success' : task.status === 2 ? 'warning' : 'info',
    }))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '•'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
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
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-600"> {activity.action} </span>
                  <span className="font-medium">{activity.target}</span>
                </div>
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
