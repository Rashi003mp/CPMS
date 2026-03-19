"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/lib/hooks/useProjects"
import { useAuthStore } from "@/store/authStore"
import { CreateProjectModal } from "@/components/projects/create-project-modal"
import { EditProjectModal } from "@/components/projects/edit-project-modal"
import { Plus, Search, Filter, Building2, MoreVertical, Edit, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "@/lib/api/projects"
import toast from "react-hot-toast"
import type { Project } from "@/types/project"

export default function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const pageSize = 10
  const queryClient = useQueryClient()
  
  // Get current user from auth store
  const { user } = useAuthStore()
  const isClient = user?.roleId === 3

  // For clients, fetch only their projects; for others, fetch all projects
  const { data, isLoading, error } = useProjects(
    page, 
    pageSize, 
    search, 
    undefined, 
    isClient ? user?.id : undefined
  )

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      projectsApi.delete(id, reason),
    onSuccess: () => {
      toast.success('Project deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const reason = prompt(`Are you sure you want to delete "${project.name}"?\n\nPlease provide a reason:`)
    if (reason && reason.trim()) {
      deleteMutation.mutate({ id: project.id, reason: reason.trim() })
    }
  }

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingProject(project)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Planned":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      case "OnHold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            {isClient 
              ? "View your assigned construction projects"
              : "Manage and track all your construction projects"
            }
          </p>
        </div>
        {!isClient && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10 border-gray-200 bg-gray-50 focus:bg-white transition-colors h-11 rounded-xl"
              />
            </div>
            <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-20 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-gray-500 font-medium">Loading projects...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-20 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-red-600 font-medium">
              Error loading projects. Please try again.
            </div>
          </CardContent>
        </Card>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((project) => (
              <div key={project.id} className="relative group">
                <Link href={`/projects/${project.id}`}>
                  <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    {/* Project Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {project.imageUrl && !imageErrors[project.id] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={project.imageUrl}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [project.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50">
                          <div className="p-4 rounded-full bg-white shadow-sm mb-3">
                            <Building2 className="h-8 w-8 text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-blue-900/40">No preview</span>
                        </div>
                      )}
                      
                      {/* Status Badge Overlaid */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`px-2.5 py-1 font-medium shadow-sm backdrop-blur-md border-0 ${
                            project.status === "Active" ? "bg-green-500/90 text-white" :
                            project.status === "Planned" ? "bg-blue-500/90 text-white" :
                            project.status === "Completed" ? "bg-gray-600/90 text-white" :
                            "bg-yellow-500/90 text-white"
                          }`}>
                          {project.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />}
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-2">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-2 min-h-[2.5rem]">
                        {project.description || "No description provided"}
                      </p>
                      
                      {/* Details Strip */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        {project.projectManagerName && (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {project.projectManagerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold truncate hover:text-gray-500">Project Manager</p>
                              <p className="text-sm font-medium text-gray-900 truncate">{project.projectManagerName}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                          {project.createdByUserName && (
                             <span className="truncate max-w-[120px]">By {project.createdByUserName.split(' ')[0]}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Dropdown Menu - Only for non-clients */}
                {!isClient && (
                  <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem
                          onClick={(e) => handleEdit(project, e)}
                          className="cursor-pointer hover:bg-gray-50 rounded-lg group/item"
                        >
                          <Edit className="w-4 h-4 mr-2 text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                          <span className="font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors">Edit Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(project, e)}
                          className="cursor-pointer hover:bg-red-50 rounded-lg group/item mt-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-red-400 group-hover/item:text-red-500 transition-colors" />
                          <span className="font-medium text-red-600 transition-colors">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No projects found</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
        />
      )}
    </div>
  )
}
