"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import { tasksApi } from '@/lib/api/tasks'
import { usersApi } from '@/lib/api/users'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter,
  Calendar,
  User,
  FolderKanban,
  Loader2
} from "lucide-react"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants'
import { TaskStatus } from '@/types/task'
import { EditTaskModal } from '@/components/tasks/edit-task-modal'
import type { Task } from '@/types/task'

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Fetch all users to map IDs to names
  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  // Fetch all projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(1, 100),
  })

  // Fetch tasks for all projects
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      if (!projectsData?.items) return []
      
      const taskPromises = projectsData.items.map(project =>
        tasksApi.getByProject(project.id).catch(() => [])
      )
      
      const tasksArrays = await Promise.all(taskPromises)
      return tasksArrays.flat()
    },
    enabled: !!projectsData?.items && projectsData.items.length > 0,
    refetchOnMount: 'always',
  })

  // Sort tasks by creation date
  const allTasks = (allTasksData || []).sort(
    (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  )

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status.toString() === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: allTasks.length,
    todo: allTasks.filter(t => t.status === TaskStatus.Todo).length,
    inProgress: allTasks.filter(t => t.status === TaskStatus.InProgress).length,
    completed: allTasks.filter(t => t.status === TaskStatus.Completed).length,
    overdue: allTasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Completed
    ).length,
  }

  const isLoading = projectsLoading || tasksLoading

  const getProjectName = (projectId: number) => {
    return projectsData?.items?.find(p => p.id === projectId)?.name || 'Unknown Project'
  }

  const getUserName = (userId: number) => {
    return allUsers?.find(u => u.userId === userId)?.userName || 'Unknown User'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    return new Date(dueDate) < new Date() && status !== TaskStatus.Completed
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Tasks</h2>
          <p className="text-gray-600 mt-2">Track and manage tasks across all projects</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">To Do</div>
            <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={TaskStatus.Todo.toString()}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.InProgress.toString()}>In Progress</SelectItem>
                  <SelectItem value={TaskStatus.Blocked.toString()}>Blocked</SelectItem>
                  <SelectItem value={TaskStatus.Completed.toString()}>Completed</SelectItem>
                  <SelectItem value={TaskStatus.Cancelled.toString()}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No tasks found matching your filters' 
                : 'No tasks available'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <Badge className={TASK_STATUS_COLORS[task.status]}>
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        {isOverdue(task.dueDate, task.status) && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FolderKanban className="w-4 h-4" />
                          <span>{getProjectName(task.projectId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{getUserName(task.assignedToUserId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </div>
  )
}
