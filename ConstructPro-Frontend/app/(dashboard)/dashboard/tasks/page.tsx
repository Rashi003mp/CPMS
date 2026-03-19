"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
import type { Task } from '@/types/task'
import { TaskCard } from '@/components/tasks/task-card'
import { useRealtimeTasks } from '@/lib/hooks/useRealtimeTasks'

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()

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

  // Listen for real-time task updates via SignalR across all projects
  const projectIds = projectsData?.items?.map(p => p.id) || []
  useRealtimeTasks(projectIds)

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

  const getPriorityColor = (dueDate: string, status: number) => {
    if (status === 3) return 'bg-green-100 text-green-800'
    const daysUntilDue = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilDue < 0) return 'bg-red-100 text-red-800'
    if (daysUntilDue <= 2) return 'bg-orange-100 text-orange-800'
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getPriorityLabel = (dueDate: string, status: number) => {
    if (status === 3) return 'COMPLETED'
    const daysUntilDue = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilDue < 0) return 'OVERDUE'
    if (daysUntilDue <= 2) return 'CRITICAL PRIORITY'
    if (daysUntilDue <= 7) return 'HIGH PRIORITY'
    return 'NORMAL PRIORITY'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Tasks</h2>
          <p className="text-gray-500 mt-1">Track and manage tasks across all projects</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50/50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-gray-100/50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-gray-600 mb-1">{stats.todo}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">To Do</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-blue-600 mb-1">{stats.inProgress}</span>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</span>
            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Completed</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-red-600 mb-1">{stats.overdue}</span>
            <span className="text-xs font-medium text-red-600 uppercase tracking-wider">Overdue</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters Search Bar */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500" />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl w-full"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-lg border-gray-100 p-1">
                  <SelectItem value="all" className="rounded-lg cursor-pointer hover:bg-gray-50">All Statuses</SelectItem>
                  <SelectItem value={TaskStatus.Todo.toString()} className="rounded-lg cursor-pointer hover:bg-gray-50">To Do</SelectItem>
                  <SelectItem value={TaskStatus.InProgress.toString()} className="rounded-lg cursor-pointer hover:bg-gray-50">In Progress</SelectItem>
                  <SelectItem value={TaskStatus.Blocked.toString()} className="rounded-lg cursor-pointer hover:bg-gray-50">Blocked</SelectItem>
                  <SelectItem value={TaskStatus.Completed.toString()} className="rounded-lg cursor-pointer hover:bg-gray-50">Completed</SelectItem>
                  <SelectItem value={TaskStatus.Cancelled.toString()} className="rounded-lg cursor-pointer hover:bg-gray-50">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="border-0 shadow-md overflow-hidden bg-gray-50">
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Task List <span className="text-gray-400 font-normal text-sm ml-2">({filteredTasks.length} results)</span></CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                 <Loader2 className="w-6 h-6 animate-spin text-primary" />
               </div>
               <span className="text-gray-500 font-medium">Loading tasks...</span>
             </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                <FolderKanban className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to find what you are looking for' 
                  : 'There are no pending tasks assignments right now.'}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  priorityColor={getPriorityColor(task.dueDate, task.status)}
                  priorityLabel={getPriorityLabel(task.dueDate, task.status)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
