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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usersApi, type UserListItem } from '@/lib/api/users'
import { projectUsersApi } from '@/lib/api/project-users'
import { Users, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReplaceUserModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  oldUserId: number
  oldUserName: string
  roleId: number // 1 = PM, 2 = SE
  roleName: string
}

export function ReplaceUserModal({
  isOpen,
  onClose,
  projectId,
  oldUserId,
  oldUserName,
  roleId,
  roleName,
}: ReplaceUserModalProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

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
      user.userId !== oldUserId &&
      user.activeProjectCount < 5 &&
      (roleId === 1
        ? user.roleName === 'ProjectManager'
        : user.roleName === 'SiteEngineer')
  ) || []

  // Replace user mutation
  const replaceMutation = useMutation({
    mutationFn: (newUserId: number) =>
      projectUsersApi.replaceUser({
        projectId,
        oldUserId,
        newUserId,
        roleId,
        reason,
      }),
    onSuccess: () => {
      toast.success('User replaced successfully')
      queryClient.invalidateQueries({ queryKey: ['project', projectId.toString()] })
      onClose()
      setReason('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to replace user')
    },
  })

  const handleReplace = (newUserId: number) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for replacement')
      return
    }
    replaceMutation.mutate(newUserId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Replace {roleName}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current User Info */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Current User</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                {oldUserName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{oldUserName}</div>
                <div className="text-sm text-gray-600">{roleName}</div>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Reason for Replacement <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Reassignment to another project, Performance issues, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Available Users List */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Replacement {roleName}
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
                No available {roleName.toLowerCase()}s found
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                        onClick={() => handleReplace(user.userId)}
                        disabled={replaceMutation.isPending || !reason.trim()}
                      >
                        {replaceMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Replace'
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
