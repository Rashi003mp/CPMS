"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  usePendingRegistrations,
  useApproveRegistration,
  useRejectRegistration,
} from "@/lib/hooks/useUsers"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function ApprovalsPage() {
  const { data: registrations, isLoading, error } = usePendingRegistrations()
  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  const handleApprove = async (id: number) => {
    try {
      await approveRegistration.mutateAsync(id)
    } catch (error) {
      console.error("Error approving registration:", error)
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      await rejectRegistration.mutateAsync({ id, reason })
    } catch (error) {
      console.error("Error rejecting registration:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registration Approvals</h1>
        <p className="text-gray-500 mt-1">
          Review and approve pending user registration requests
        </p>
      </div>

      {/* Approvals Table */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500" />
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="p-2 rounded-xl bg-orange-50">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            Pending Requests
            {registrations && registrations.length > 0 && (
               <Badge className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 shadow-none font-medium text-xs">
                 {registrations.length}
               </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
               <span className="text-gray-500 font-medium">Loading pending registrations...</span>
             </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium">
              Error loading registrations. Please try again.
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-500 min-w-[200px]">Candidate</TableHead>
                    <TableHead className="font-semibold text-gray-500 hidden xl:table-cell">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-500">Role & Experience</TableHead>
                    <TableHead className="font-semibold text-gray-500 hidden lg:table-cell">Skills</TableHead>
                    <TableHead className="font-semibold text-gray-500">Project</TableHead>
                    <TableHead className="font-semibold text-gray-500 hidden md:table-cell">Requested</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 flex items-center justify-center font-bold shadow-sm">
                             {registration.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-semibold text-gray-900">{registration.name}</p>
                             <p className="text-sm text-gray-500">{registration.email}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="text-sm font-medium text-gray-700">{registration.phoneNumber}</div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1.5 items-start">
                           <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 font-medium shadow-sm">
                             {registration.roleName}
                           </Badge>
                           <span className="text-xs text-gray-500">
                             {registration.experienceYears ? `${registration.experienceYears} yrs experience` : "No experience listed"}
                           </span>
                         </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="max-w-[200px] text-sm text-gray-600 truncate" title={registration.skills || ""}>
                          {registration.skills || <span className="text-gray-400 italic">None specified</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] text-sm font-medium text-gray-700 truncate" title={registration.projectName || ""}>
                          {registration.projectName || <span className="text-gray-400 italic">No assigned project</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-gray-500">
                           {new Date(registration.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(registration.id)}
                            disabled={approveRegistration.isPending || rejectRegistration.isPending}
                            className="text-green-600 bg-green-50/50 hover:bg-green-100 hover:text-green-700 border border-green-200/50 rounded-lg shadow-sm font-medium px-3"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(registration.id)}
                            disabled={approveRegistration.isPending || rejectRegistration.isPending}
                            className="text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 border border-red-200/50 rounded-lg shadow-sm font-medium px-3"
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                 <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-500 text-sm">
                There are no pending registration requests at the moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
