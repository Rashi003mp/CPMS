'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usersApi, type UserListItem } from '@/lib/api/users'
import { projectUsersApi } from '@/lib/api/project-users'
import { Users, Briefcase, HardHat, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssignUsersModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

export function AssignUsersModal({ isOpen, onClose, projectId }: AssignUsersModalProps) {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<1 | 2>(1) // 1 = PM, 2 = SE

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: isOpen,
  })

  // Filter users based on role and active project count
  const availableUsers = users?.filter(
    (user) =>
      user.isActive &&
      user.activeProjectCount < 5 &&
      (selectedRole === 1
        ? user.roleName === 'ProjectManager'
        : user.roleName === 'SiteEngineer')
  ) || []

  // Assign user mutation
  const assignMutation = useMutation({
    mutationFn: (userId: number) =>
      projectUsersApi.assignUser(projectId, {
        role: selectedRole,
        assignedUserId: userId,
        assignedUserName: users?.find(u => u.userId === userId)?.userName || '',
      }),
    onSuccess: () => {
      toast.success('User assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['project', projectId.toString()] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign user')
    },
  })

  const handleAssign = (userId: number) => {
    assignMutation.mutate(userId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assign User to Project
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Role
            </label>
            <div className="flex gap-3">
              <Button
                variant={selectedRole === 1 ? 'default' : 'outline'}
                onClick={() => setSelectedRole(1)}
                className="flex-1"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Project Manager
              </Button>
              <Button
                variant={selectedRole === 2 ? 'default' : 'outline'}
                onClick={() => setSelectedRole(2)}
                className="flex-1"
              >
                <HardHat className="w-4 h-4 mr-2" />
                Site Engineer
              </Button>
            </div>
          </div>

          {/* Available Users List */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Available {selectedRole === 1 ? 'Project Managers' : 'Site Engineers'}
              <span className="text-gray-500 font-normal ml-2">
                (Active Projects &lt; 5)
              </span>
            </label>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No available {selectedRole === 1 ? 'project managers' : 'site engineers'} found
              </div>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.userName}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {user.activeProjectCount} Active Project{user.activeProjectCount !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleAssign(user.userId)}
                        disabled={assignMutation.isPending}
                      >
                        {assignMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Assign'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
