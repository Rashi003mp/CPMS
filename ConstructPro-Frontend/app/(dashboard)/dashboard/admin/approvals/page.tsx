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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading pending registrations...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading registrations. Please try again.
            </div>
          ) : registrations && registrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.name}
                    </TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>{registration.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{registration.roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      {registration.experienceYears
                        ? `${registration.experienceYears} years`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {registration.skills || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {registration.projectName || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(registration.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(registration.id)}
                          disabled={
                            approveRegistration.isPending ||
                            rejectRegistration.isPending
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(registration.id)}
                          disabled={
                            approveRegistration.isPending ||
                            rejectRegistration.isPending
                          }
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending registrations</p>
              <p className="text-gray-400 text-sm mt-2">
                All registration requests have been processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
