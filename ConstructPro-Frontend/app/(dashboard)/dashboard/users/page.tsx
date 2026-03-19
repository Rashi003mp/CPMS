"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers, useDeactivateUser, useActivateUser } from "@/lib/hooks/useUsers"
import { Search, UserCheck, UserX } from "lucide-react"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const { data: users, isLoading, error } = useUsers()
  const deactivateUser = useDeactivateUser()
  const activateUser = useActivateUser()

  const filteredUsers = users?.filter(
    (user) =>
      user.userName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.roleName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser.mutateAsync(userId)
      } else {
        await activateUser.mutateAsync(userId)
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage system users and their access</p>
      </div>

      {/* Search */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
           <CardTitle className="text-lg font-semibold text-gray-900">
             All Users {filteredUsers && <span className="text-gray-400 font-normal text-sm ml-2">({filteredUsers.length})</span>}
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
               <span className="text-gray-500 font-medium">Loading users...</span>
             </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium">
              Error loading users. Please try again.
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-500">User</TableHead>
                    <TableHead className="font-semibold text-gray-500 hidden md:table-cell">Role</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-center">Projects</TableHead>
                    <TableHead className="font-semibold text-gray-500">Status</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.userId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                             {user.userName.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{user.userName}</p>
                             <p className="text-sm text-gray-500">{user.email}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="bg-white border-gray-200 text-gray-600 font-medium shadow-sm">
                          {user.roleName || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 font-medium">
                        {user.activeProjectCount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`shadow-sm border-0 font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-lg transition-colors shadow-sm border ${
                             user.isActive 
                               ? 'text-gray-600 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700' 
                               : 'text-gray-600 border-gray-200 hover:border-green-200 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => handleToggleStatus(user.userId, user.isActive)}
                          disabled={deactivateUser.isPending || activateUser.isPending}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-20">
               <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                 <Search className="h-8 w-8 text-gray-300" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
               <p className="text-gray-500">
                  {search ? "No users found matching your search term." : "There are currently no users in the system."}
               </p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
