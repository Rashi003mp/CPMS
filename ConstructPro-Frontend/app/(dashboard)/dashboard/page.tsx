"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/lib/hooks/useProjects"
import { useUsers } from "@/lib/hooks/useUsers"
import { usePendingRegistrations } from "@/lib/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"
import { projectsApi } from "@/lib/api/projects"
import { tasksApi } from "@/lib/api/tasks"
import { usersApi } from "@/lib/api/users"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants"
import { TaskStatus } from "@/types/task"
import {
  Building2,
  Users,
  FolderKanban,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  ListTodo,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRealtimeTasks } from "@/lib/hooks/useRealtimeTasks"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.roleId === 0
  const isClient = user?.roleId === 3

  // For clients, fetch only their projects; for others, fetch all projects
  const { data: projects, isLoading: projectsLoading } = useProjects(
    1,
    100,
    undefined,
    undefined,
    isClient ? user?.id : undefined
  )
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: pendingRegistrations, isLoading: pendingLoading } =
    usePendingRegistrations()

  // Fetch tasks for the "Recent Tasks" card
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      if (!projects?.items) return []
      const taskPromises = projects.items.map((project) =>
        tasksApi.getByProject(project.id).catch(() => [])
      )
      const tasksArrays = await Promise.all(taskPromises)
      return tasksArrays.flat()
    },
    enabled: !!projects?.items && projects.items.length > 0,
  })

  const { data: allUsers } = useQuery({
    queryKey: ["users-all"],
    queryFn: () => usersApi.getAll(),
  })

  // Listen for real-time task updates across all joined projects
  const projectIds = projects?.items?.map((p) => p.id) || []
  useRealtimeTasks(projectIds)

  // Calculate stats
  const totalProjects = projects?.totalCount || 0
  const activeProjects =
    projects?.items.filter((p) => p.status === "Active").length || 0
  const totalUsers = users?.length || 0
  const pendingApprovals = pendingRegistrations?.length || 0

  // Recent data
  const recentPending = (pendingRegistrations || []).slice(0, 3)
  const recentTasks = (allTasksData || [])
    .sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    )
    .slice(0, 4)

  // Helpers
  const getProjectName = (projectId: number) =>
    projects?.items?.find((p) => p.id === projectId)?.name || "Unknown Project"

  const getUserName = (userId: number) =>
    allUsers?.find((u) => u.userId === userId)?.userName || "Unassigned"

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const isOverdue = (dueDate: string, status: TaskStatus) =>
    new Date(dueDate) < new Date() && status !== TaskStatus.Completed

  const stats = [
    {
      title: "Total Projects",
      value: projectsLoading ? "..." : totalProjects,
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/dashboard/projects",
    },
    {
      title: "Active Projects",
      value: projectsLoading ? "..." : activeProjects,
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/dashboard/projects",
    },
    {
      title: "Total Users",
      value: usersLoading ? "..." : totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/dashboard/users",
      adminOnly: true,
    },
    {
      title: "Pending Approvals",
      value: pendingLoading ? "..." : pendingApprovals,
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "/dashboard/admin/approvals",
      adminOnly: true,
    },
  ]

  const visibleStats = isAdmin ? stats : stats.filter((s) => !s.adminOnly)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening with
          your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ─── LinkedIn-inspired Summary Cards ─── */}
      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* ── Recent Pending Approvals ── */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                    <UserCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      Pending Approvals
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pendingApprovals} request
                      {pendingApprovals !== 1 ? "s" : ""} waiting
                    </p>
                  </div>
                </div>
                {pendingApprovals > 0 && (
                  <span className="flex items-center justify-center h-7 min-w-[1.75rem] px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold shadow-sm animate-pulse">
                    {pendingApprovals}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : recentPending.length > 0 ? (
                <div className="space-y-0">
                  {recentPending.map((reg, idx) => (
                    <div
                      key={reg.id}
                      className={`flex items-center gap-3 py-3 ${
                        idx !== recentPending.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Avatar initials */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {reg.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {reg.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {reg.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0 border-primary/30 text-primary"
                        >
                          {reg.roleName}
                        </Badge>
                        <span className="text-[10px] text-gray-400">
                          {timeAgo(reg.requestedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <UserCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    All caught up!
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    No pending requests
                  </p>
                </div>
              )}

              {/* See more – LinkedIn style full-width ghost button */}
              <Link href="/dashboard/admin/approvals">
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/5 font-medium text-sm rounded-xl border border-transparent hover:border-primary/10 transition-all"
                >
                  See all approvals
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* ── Recent Tasks ── */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-indigo-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <ListTodo className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      Recent Tasks
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Latest tasks across projects
                    </p>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              {tasksLoading || projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-0">
                  {recentTasks.map((task, idx) => (
                    <Link
                      key={task.id}
                      href={`/dashboard/tasks/${task.id}`}
                      className={`flex items-start gap-3 py-3 hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors ${
                        idx !== recentTasks.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Status indicator dot */}
                      <div className="flex-shrink-0 mt-1.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm ${
                            task.status === TaskStatus.Completed
                              ? "bg-green-500"
                              : task.status === TaskStatus.InProgress
                              ? "bg-blue-500 animate-pulse"
                              : task.status === TaskStatus.Blocked
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                            <FolderKanban className="h-3 w-3 flex-shrink-0" />
                            {getProjectName(task.projectId)}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            {getUserName(task.assignedToUserId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge
                          className={`text-[10px] px-2 py-0.5 ${
                            TASK_STATUS_COLORS[task.status]
                          }`}
                        >
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        {isOverdue(task.dueDate, task.status) ? (
                          <span className="text-[10px] text-red-500 font-medium">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            Due {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <ListTodo className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No tasks yet
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Create tasks inside your projects
                  </p>
                </div>
              )}

              {/* See more – LinkedIn style full-width ghost button */}
              <Link href="/dashboard/tasks">
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/5 font-medium text-sm rounded-xl border border-transparent hover:border-primary/10 transition-all"
                >
                  See all tasks
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Recent Projects ── */}
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Recent Projects
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your most recent construction projects
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : projects && projects.items.length > 0 ? (
            <div className="space-y-0">
              {projects.items.slice(0, 5).map((project, idx) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className={`flex items-start gap-3 py-3 hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors ${
                    idx !== Math.min(projects.items.length, 5) - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  {/* Icon/Avatar for Project */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm mt-0.5">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {project.description || "No description provided"}
                    </p>
                    {project.projectManagerName && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-[11px] text-gray-500">
                          {project.projectManagerName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0 border-0 font-medium ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Planned"
                          ? "bg-blue-100 text-blue-700"
                          : project.status === "Completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {project.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {timeAgo(project.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No projects found
              </p>
              <Link
                href="/dashboard/projects"
                className="text-xs text-primary hover:underline mt-1"
              >
                Create your first project
              </Link>
            </div>
          )}

          {/* See more – LinkedIn style full-width ghost button */}
          <Link href="/dashboard/projects">
            <Button
              variant="ghost"
              className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/5 font-medium text-sm rounded-xl border border-transparent hover:border-primary/10 transition-all"
            >
              See all projects
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Pending Approvals Banner (Admin Only) */}
      {isAdmin && pendingApprovals > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800">
              You have {pendingApprovals} registration request
              {pendingApprovals !== 1 ? "s" : ""} waiting for approval.
            </p>
            <Link
              href="/dashboard/admin/approvals"
              className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Review Requests
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
