'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MessageSquare, MoreVertical } from 'lucide-react'
import { formatDate } from '@/lib/helpers/date'
import type { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { EditTaskModal } from './edit-task-modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'

interface TaskCardProps {
  task: Task
  priorityColor: string
  priorityLabel: string
}

export function TaskCard({ task, priorityColor, priorityLabel }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const getStatusLabel = (status: number) => {
    const labels = ['To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled']
    return labels[status] || 'Unknown'
  }

  const getStatusColor = (status: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-blue-100 text-blue-800',
      'bg-red-100 text-red-800',
      'bg-green-100 text-green-800',
      'bg-gray-100 text-gray-800',
    ]
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={priorityColor}>
                  {priorityLabel}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>0</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {task.assignedToUserId}
            </div>
          </div>

          {task.status === 3 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">100% COMPLETE</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-full h-full bg-green-600 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {task.status !== 3 && task.status !== 4 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {task.status === 1 ? 'In Progress' : 'Not Started'}
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: task.status === 1 ? '50%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
      />
    </>
  )
}
