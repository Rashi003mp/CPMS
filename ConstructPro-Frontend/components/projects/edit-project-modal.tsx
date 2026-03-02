'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import { ProjectStatus, type Project, type UpdateProjectRequest } from '@/types/project'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import toast from 'react-hot-toast'

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

const PROJECT_STATUS_OPTIONS = [
  { value: ProjectStatus.Planned.toString(), label: 'Planned' },
  { value: ProjectStatus.Active.toString(), label: 'Active' },
  { value: ProjectStatus.OnHold.toString(), label: 'On Hold' },
  { value: ProjectStatus.Completed.toString(), label: 'Completed' },
]

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const queryClient = useQueryClient()
  
  // Convert status string to enum value
  const getStatusEnum = (statusString: string): ProjectStatus => {
    switch (statusString) {
      case 'Active': return ProjectStatus.Active
      case 'Planned': return ProjectStatus.Planned
      case 'OnHold': return ProjectStatus.OnHold
      case 'Completed': return ProjectStatus.Completed
      default: return ProjectStatus.Planned
    }
  }
  
  const [formData, setFormData] = useState({
    projectName: project.name,
    description: project.description || '',
    status: getStatusEnum(project.status),
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    remarks: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      projectName: project.name,
      description: project.description || '',
      status: getStatusEnum(project.status),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      remarks: '',
    })
    setImage(null)
    setRemoveImage(false)
  }, [project])

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updateData: UpdateProjectRequest }) =>
      projectsApi.update(data.id, data.updateData),
    onSuccess: () => {
      toast.success('Project updated successfully')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
      handleClose()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update project'
      setErrors({ submit: message })
      toast.error(message)
    },
  })

  const handleClose = () => {
    setErrors({})
    setImage(null)
    setRemoveImage(false)
    onClose()
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Remarks are required for updating a project'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const updateData: UpdateProjectRequest = {
      projectName: formData.projectName,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      remarks: formData.remarks,
      image: image || undefined,
      removeImage: removeImage,
    }

    updateMutation.mutate({ id: project.id, updateData })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="projectName">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              placeholder="Enter project name"
            />
            {errors.projectName && (
              <p className="text-sm text-red-500 mt-1">{errors.projectName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: parseInt(value) as ProjectStatus,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">
              Remarks <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Enter reason for updating this project"
              rows={2}
            />
            {errors.remarks && (
              <p className="text-sm text-red-500 mt-1">{errors.remarks}</p>
            )}
          </div>

          <div>
            <Label>Project Image</Label>
            <ImageUpload
              value={image || (removeImage ? undefined : project.imageUrl)}
              onChange={(file) => {
                setImage(file)
                if (file === null && project.imageUrl) {
                  setRemoveImage(true)
                }
              }}
            />
            {project.imageUrl && !removeImage && !image && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRemoveImage(true)}
                className="mt-2"
              >
                Remove Current Image
              </Button>
            )}
            {removeImage && !image && (
              <p className="text-sm text-amber-600 mt-1">
                Current image will be removed
              </p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </div>
    </Dialog>
  )
}
