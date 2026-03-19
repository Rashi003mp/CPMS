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
  FileText,
  Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/helpers/date'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { TaskCard } from '@/components/tasks/task-card'
import { useState } from 'react'
import { useRealtimeTasks } from '@/lib/hooks/useRealtimeTasks'
import { useParams } from 'next/navigation'

export default function ProjectDashboardPage() {
  const params = useParams()
  const id = params.id as string
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')

  // Listen for real-time task updates via SignalR
  useRealtimeTasks(Number(id))

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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
         <div className="text-gray-500 font-medium">Loading project details...</div>
      </div>
    )
  }

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
           <AlertTriangle className="h-8 w-8" />
         </div>
         <div className="text-lg font-semibold text-gray-900 mb-1">Error loading project</div>
         <div className="text-sm text-gray-500">
           {projectError instanceof Error ? projectError.message : 'Unknown error occurred'}
         </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
           <AlertTriangle className="h-8 w-8" />
         </div>
         <div className="text-lg font-semibold text-gray-900 mb-1">Project not found</div>
         <div className="text-sm text-gray-500">The project you are looking for does not exist or was deleted.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header Profile Section */}
      <Card className="border-0 shadow-sm overflow-hidden bg-white">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardContent className="px-6 sm:px-10 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 relative z-10">
            <div className="flex items-end gap-5">
              <div className="h-24 w-24 rounded-2xl bg-white shadow-md p-1.5 flex-shrink-0">
                <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-3xl">
                  {project.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none mb-2">{project.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{project.description || "No location provided"}</span>
                </div>
              </div>
            </div>
            
            <div className="md:min-w-[240px] bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-gray-600">OVERALL PROGRESS</span>
                <span className="text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Based on currently completed tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50/50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <FileText className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-3xl font-bold text-gray-900 mb-1">{totalTasks}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</span>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-3xl font-bold text-blue-600 mb-1">{inProgressTasks}</span>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</span>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mb-2" />
            <span className="text-3xl font-bold text-green-600 mb-1">{completedTasks}</span>
            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Completed</span>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
            <span className="text-3xl font-bold text-red-600 mb-1">{overdueTasks}</span>
            <span className="text-xs font-medium text-red-600 uppercase tracking-wider">Overdue Tasks</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar - Team & Info */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Key Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              {project.projectManagerName && (
                <div className="flex items-center gap-3 group">
                  <div className="h-11 w-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm border border-indigo-100 transition-transform group-hover:scale-105">
                     {project.projectManagerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{project.projectManagerName}</div>
                    <div className="text-xs text-gray-500 font-medium">Project Manager</div>
                  </div>
                </div>
              )}

              {project.siteEngineerName?.map((engineer, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="h-11 w-11 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold shadow-sm border border-slate-200 transition-transform group-hover:scale-105">
                     {engineer.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{engineer}</div>
                    <div className="text-xs text-gray-500 font-medium">Site Engineer</div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50 group">
                <div className="h-11 w-11 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold shadow-sm border border-gray-200 transition-transform group-hover:scale-105">
                  <span className="sr-only">Creator</span>
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{project.createdByUserName || 'Unknown'}</div>
                  <div className="text-xs text-gray-500 font-medium">Project Creator</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tasks Feed */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <CardHeader className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                Project Tasks Feed
                <Badge className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 shadow-none font-semibold">
                  {filteredTasks.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   onClick={() => setIsCreateTaskOpen(true)}
                   className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   New Task
                 </Button>
              </div>
            </CardHeader>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto whitespace-nowrap hide-scrollbar">
              <div className="flex gap-2 min-w-max">
                {['ALL', 'STRUCTURAL', 'SAFETY', 'PLUMBING'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className={`rounded-full h-8 px-4 text-xs font-semibold tracking-wide transition-all ${
                       selectedFilter === filter 
                          ? 'bg-blue-600 text-white shadow-md border-transparent hover:bg-blue-700' 
                          : 'bg-white text-gray-600 border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
            
            <CardContent className="p-5 bg-gray-50/50">
              <div className="max-w-2xl mx-auto">
                {tasksLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <span className="text-gray-500 font-medium">Loading project tasks feed...</span>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckCircle2 className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No active tasks</h3>
                    <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                      There are no active tasks under this category. You're all caught up!
                    </p>
                    <Button onClick={() => setIsCreateTaskOpen(true)} variant="outline" className="rounded-xl">
                      Create a Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
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
