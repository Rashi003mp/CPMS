'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { projectsApi } from '@/lib/api/projects'
import { TaskStatus, type CreateTaskRequest } from '@/types/task'
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
import { usersApi } from '@/lib/api/users'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.Todo.toString(), label: 'To Do' },
  { value: TaskStatus.InProgress.toString(), label: 'In Progress' },
  { value: TaskStatus.Blocked.toString(), label: 'Blocked' },
]

export function CreateTaskModal({ isOpen, onClose, projectId }: CreateTaskModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToUserId: '',
    dueDate: '',
    status: TaskStatus.Todo,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch project details to get assigned users
  const { data: project } = useQuery({
    queryKey: ['project', projectId.toString()],
    queryFn: () => projectsApi.getById(projectId),
    enabled: isOpen,
  })

  // Fetch all users to get user IDs
  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: isOpen,
  })

  // Build list of project users
  const projectUsers = []
  if (project && allUsers) {
    // Add project manager
    if (project.projectManagerName) {
      const pmUser = allUsers.find(u => u.userName === project.projectManagerName)
      if (pmUser) {
        projectUsers.push({
          id: pmUser.userId,
          name: pmUser.userName,
          role: 'Project Manager'
        })
      }
    }
    
    // Add site engineers
    if (project.siteEngineerName && project.siteEngineerName.length > 0) {
      project.siteEngineerName.forEach(engineerName => {
        const seUser = allUsers.find(u => u.userName === engineerName)
        if (seUser) {
          projectUsers.push({
            id: seUser.userId,
            name: seUser.userName,
            role: 'Site Engineer'
          })
        }
      })
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId.toString()] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      handleClose()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create task'
      setErrors({ submit: message })
    },
  })

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assignedToUserId: '',
      dueDate: '',
      status: TaskStatus.Todo,
    })
    setErrors({})
    onClose()
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.assignedToUserId) {
      newErrors.assignedToUserId = 'Assigned user is required'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    createMutation.mutate({
      projectId,
      title: formData.title,
      description: formData.description,
      assignedToUserId: parseInt(formData.assignedToUserId),
      dueDate: formData.dueDate,
      status: formData.status,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="assignedTo">
              Assign To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.assignedToUserId}
              onValueChange={(value) =>
                setFormData({ ...formData, assignedToUserId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project user" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {projectUsers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No users assigned to this project
                  </SelectItem>
                ) : (
                  projectUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.assignedToUserId && (
              <p className="text-sm text-red-500 mt-1">{errors.assignedToUserId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: parseInt(value) as TaskStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
