'use client'

'use client'

import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import { tasksApi } from '@/lib/api/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react'
import { formatDate } from '@/lib/helpers/date'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { TaskCard } from '@/components/tasks/task-card'
import { LiveActivityFeed } from '@/components/projects/live-activity-feed'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProjectDashboardPage() {
  const params = useParams()
  const id = params.id as string
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')

  // Fetch project details
  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(parseInt(id)),
    enabled: !!id,
  })

  // Fetch project tasks
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => tasksApi.getByProject(parseInt(id)),
    enabled: !!id, // Only fetch if we have an id
  })

  const project = projectData
  const tasks = tasksData || []

  // Log errors for debugging
  if (projectError) {
    console.error('Project fetch error:', projectError)
  }
  if (tasksError) {
    console.error('Tasks fetch error:', tasksError)
  }

  // Calculate project statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 3).length
  const inProgressTasks = tasks.filter(t => t.status === 1).length
  const overdueTasks = tasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== 3
  ).length
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'ALL') return task.status !== 3
    if (selectedFilter === 'STRUCTURAL') return task.title.toLowerCase().includes('structural')
    if (selectedFilter === 'SAFETY') return task.title.toLowerCase().includes('safety')
    if (selectedFilter === 'PLUMBING') return task.title.toLowerCase().includes('plumbing')
    return true
  })

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

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-lg text-white">Loading project...</div>
      </div>
    )
  }

  if (projectError) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="text-lg text-red-400 mb-2">Error loading project</div>
          <div className="text-sm text-slate-400">
            {projectError instanceof Error ? projectError.message : 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-lg text-white">Project not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{project.description}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">OVERALL STATUS</div>
            <div className="text-2xl font-bold text-blue-400">
              In Progress - {progressPercentage}%
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Total Tasks</div>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">In Progress</div>
                  <div className="text-2xl font-bold text-blue-400">{inProgressTasks}</div>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Completed</div>
                  <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Overdue</div>
                  <div className="text-2xl font-bold text-red-400">{overdueTasks}</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Team */}
        <div className="col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-400">
                KEY PERSONNEL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.projectManagerName && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-blue-600">
                    <AvatarFallback>
                      {project.projectManagerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{project.projectManagerName}</div>
                    <div className="text-sm text-slate-400">Project Manager</div>
                  </div>
                </div>
              )}

              {project.siteEngineerName?.map((engineer, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-slate-700">
                    <AvatarFallback>
                      {engineer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{engineer}</div>
                    <div className="text-sm text-slate-400">Site Engineer</div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-slate-700">
                  <AvatarFallback>
                    {project.createdByUserName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{project.createdByUserName}</div>
                  <div className="text-sm text-slate-400">Created By</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tasks */}
        <div className="col-span-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Tasks</CardTitle>
                <Button 
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE TASK
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                {['ALL', 'STRUCTURAL', 'SAFETY', 'PLUMBING'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className={selectedFilter === filter ? 'bg-blue-600' : ''}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No active tasks found
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priorityColor={getPriorityColor(task.dueDate, task.status)}
                    priorityLabel={getPriorityLabel(task.dueDate, task.status)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Live Activity */}
        <div className="col-span-3">
          <LiveActivityFeed projectId={parseInt(id)} />
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={parseInt(id)}
      />
    </div>
  )
}
