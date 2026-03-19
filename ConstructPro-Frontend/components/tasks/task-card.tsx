'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, MoreVertical, Calendar, CalendarClock, Loader2, User } from 'lucide-react'
import { Task, TaskStatus } from '@/types/task'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { EditTaskModal } from './edit-task-modal'
import { TaskCommentsModal } from './task-comments-modal'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { commentsApi } from '@/lib/api/comments'
import { useRouter } from 'next/navigation'

interface TaskCardProps {
  task: Task
  priorityColor: string
  priorityLabel: string
}

export function TaskCard({ task, priorityColor, priorityLabel }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch comments to show the most recent one + counter
  const { data: commentsResponse, isLoading: commentsLoading } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: () => commentsApi.getByTask(task.id),
  })

  // Ensure comments is strictly an Array.
  const comments = Array.isArray(commentsResponse?.comments) ? commentsResponse.comments : []
  const recentComment = comments.length > 0 ? comments[comments.length - 1] : null;

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: number) => tasksApi.update({
      taskId: task.id,
      projectId: task.projectId,
      status: newStatus
    }),
    onSuccess: () => {
      // Invalidation handled globally by SignalR, but good for local fast fallback
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] })
      toast.success('Status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  })

  // getStatusLabel and color logic is kept for generic use

  const getStatusLabel = (status: number) => {
    const labels = ['To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled']
    return labels[status] || 'Unknown'
  }

  const getStatusColor = (status: number) => {
    const colors = [
      'bg-gray-100 text-gray-800 hover:bg-gray-200',
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-red-100 text-red-800 hover:bg-red-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-gray-100 text-gray-800 hover:bg-gray-200',
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
      <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden mb-4">
        {/* Top Header representing Author/Creation */}
        <div className="flex items-start justify-between p-4 pb-2 border-b border-gray-50/50">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                <User className="h-5 w-5" />
             </div>
             <div>
               <div className="font-semibold text-gray-900 leading-tight">Assigned to: ID {task.assignedToUserId}</div>
               <div className="text-xs text-gray-500 font-medium tracking-wide">
                 Due {new Date(task.dueDate).toLocaleDateString()}
               </div>
             </div>
           </div>
           
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                 <MoreVertical className="h-5 w-5" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-gray-100 shadow-lg">
               <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg cursor-pointer">
                 Edit Task
               </DropdownMenuItem>
               <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg cursor-pointer">
                 Delete Task
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>

        {/* Task Body */}
        <CardContent className="p-0">
           <div 
             className="px-4 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
             onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
           >
             <div className="flex items-center gap-2 mb-3">
               <Badge variant="outline" className={`font-medium border-0 px-2 py-0.5 shadow-sm text-xs ${priorityColor}`}>
                 {priorityLabel}
               </Badge>
               <div onClick={(e) => e.stopPropagation()}>
                 <Select
                    value={task.status.toString()}
                    onValueChange={(val) => updateStatusMutation.mutate(parseInt(val))}
                    disabled={updateStatusMutation.isPending}
                 >
                   <SelectTrigger className={`h-[22px] text-[11px] font-semibold border-0 px-2.5 pb-0.5 pt-[1px] shadow-sm rounded-full outline-none focus:ring-0 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-70 ${getStatusColor(task.status)} ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value={TaskStatus.Todo.toString()} className="text-xs focus:bg-gray-100 cursor-pointer">To Do</SelectItem>
                     <SelectItem value={TaskStatus.InProgress.toString()} className="text-xs focus:bg-blue-50 text-blue-700 cursor-pointer">In Progress</SelectItem>
                     <SelectItem value={TaskStatus.Blocked.toString()} className="text-xs focus:bg-red-50 text-red-700 cursor-pointer">Blocked</SelectItem>
                     <SelectItem value={TaskStatus.Completed.toString()} className="text-xs focus:bg-green-50 text-green-700 cursor-pointer">Completed</SelectItem>
                     <SelectItem value={TaskStatus.Cancelled.toString()} className="text-xs focus:bg-gray-100 cursor-pointer">Cancelled</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2">{task.title}</h3>
             <p className="text-gray-700 text-sm leading-relaxed mb-1">
               {task.description || "No description provided format for this task."}
             </p>
           </div>
           
           {/* Interactive Comments Footer section */}
           <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 mt-1">
              <div className="flex items-center justify-between mb-3">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors px-3 py-1.5 h-auto text-sm font-medium"
                   onClick={() => setIsCommentsOpen(true)}
                >
                   <MessageSquare className="w-4 h-4 mr-2" />
                   Comment
                </Button>
                
                {comments.length > 0 && (
                   <div className="text-sm font-medium text-gray-500 hover:text-blue-600 hover:underline cursor-pointer" onClick={() => setIsCommentsOpen(true)}>
                     {comments.length} comment{comments.length !== 1 ? 's' : ''}
                   </div>
                )}
              </div>
              
              {/* Display recent comment preview if exists */}
              {commentsLoading ? (
                 <div className="flex items-center gap-2 text-xs text-gray-400 px-1 py-0.5">
                   <Loader2 className="w-3 h-3 animate-spin" /> Loading comments...
                 </div>
              ) : recentComment ? (
                 <div className="flex gap-2.5 items-start mt-2 bg-white p-2.5 rounded-xl border border-gray-100 cursor-pointer hover:border-gray-200 transition-colors" onClick={() => setIsCommentsOpen(true)}>
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-[10px]">
                      {recentComment.createdByUserName ? recentComment.createdByUserName.charAt(0).toUpperCase() : <User className="w-3 h-3"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 overflow-hidden">
                        <span className="font-semibold text-xs text-gray-900 truncate">
                          {recentComment.createdByUserName || "Unknown User"}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(recentComment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {recentComment.message}
                      </p>
                    </div>
                 </div>
              ) : null}
           </div>
        </CardContent>
      </Card>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
      />
      
      <TaskCommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        task={task}
      />
    </>
  )
}
