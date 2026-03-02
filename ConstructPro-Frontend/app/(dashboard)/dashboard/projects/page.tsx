"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/lib/hooks/useProjects"
import { CreateProjectModal } from "@/components/projects/create-project-modal"
import { Plus, Search, Filter, Building2 } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const pageSize = 10

  const { data, isLoading, error } = useProjects(page, pageSize, search)

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
            Manage and track all your construction projects
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">Loading projects...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-500">
              Error loading projects. Please try again.
            </div>
          </CardContent>
        </Card>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  {/* Project Image */}
                  <div className="relative h-48 bg-gray-200">
                    {project.imageUrl && !imageErrors[project.id] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setImageErrors((prev) => ({ ...prev, [project.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description || "No description available"}
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      {project.projectManagerName && (
                        <div>
                          <span className="font-medium">PM:</span>{" "}
                          {project.projectManagerName}
                        </div>
                      )}
                      {project.siteEngineerName && project.siteEngineerName.length > 0 && (
                        <div>
                          <span className="font-medium">Engineers:</span>{" "}
                          {project.siteEngineerName.join(", ")}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      {project.createdByUserName && (
                        <div>
                          <span className="font-medium">By:</span>{" "}
                          {project.createdByUserName}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
    </div>
  )
}
