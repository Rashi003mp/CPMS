'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { projectsApi } from '@/lib/api/projects'
import { usersApi } from '@/lib/api/users'
import { TaskStatus, type Task, type UpdateTaskRequest } from '@/types/task'
import toast from 'react-hot-toast'
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

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.Todo.toString(), label: 'To Do' },
  { value: TaskStatus.InProgress.toString(), label: 'In Progress' },
  { value: TaskStatus.Blocked.toString(), label: 'Blocked' },
  { value: TaskStatus.Completed.toString(), label: 'Completed' },
  { value: TaskStatus.Cancelled.toString(), label: 'Cancelled' },
]

export function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    assignedToUserId: task.assignedToUserId.toString(),
    dueDate: task.dueDate.split('T')[0],
    status: task.status,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedToUserId: task.assignedToUserId.toString(),
      dueDate: task.dueDate.split('T')[0],
      status: task.status,
    })
  }, [task])

  // Fetch project details to get assigned users
  const { data: project } = useQuery({
    queryKey: ['project', task.projectId.toString()],
    queryFn: () => projectsApi.getById(task.projectId),
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

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTaskRequest) => tasksApi.update(data),
    onSuccess: () => {
      toast.success('Task updated successfully')
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
      handleClose()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update task'
      setErrors({ submit: message })
    },
  })

  const handleClose = () => {
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

    updateMutation.mutate({
      taskId: task.id,
      projectId: task.projectId,
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
          <DialogTitle>Edit Task</DialogTitle>
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
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
