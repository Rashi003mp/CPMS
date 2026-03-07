"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjects } from "@/lib/hooks/useProjects"
import { useUsers } from "@/lib/hooks/useUsers"
import { usePendingRegistrations } from "@/lib/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"
import { Building2, Users, FolderKanban, UserCheck, AlertCircle } from "lucide-react"
import Link from "next/link"

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
  const { data: pendingRegistrations, isLoading: pendingLoading } = usePendingRegistrations()

  // Calculate stats
  const totalProjects = projects?.totalCount || 0
  const activeProjects = projects?.items.filter(p => p.status === "Active").length || 0
  const totalUsers = users?.length || 0
  const pendingApprovals = pendingRegistrations?.length || 0

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

  const visibleStats = isAdmin ? stats : stats.filter(s => !s.adminOnly)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {user?.name}! Here's what's happening with your projects.
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

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading projects...</div>
          ) : projects && projects.items.length > 0 ? (
            <div className="space-y-4">
              {projects.items.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description || "No description"}
                      </p>
                      {project.projectManagerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          PM: {project.projectManagerName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : project.status === "Planned"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "Completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No projects found</p>
              <Link
                href="/dashboard/projects"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Create your first project
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals (Admin Only) */}
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
              You have {pendingApprovals} registration request{pendingApprovals !== 1 ? 's' : ''} waiting for approval.
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
