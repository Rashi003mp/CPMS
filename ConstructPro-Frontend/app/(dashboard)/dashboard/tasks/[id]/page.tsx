"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { tasksApi } from "@/lib/api/tasks"
import { projectsApi } from "@/lib/api/projects"
import { usersApi } from "@/lib/api/users"
import { useComments, useCreateComment, useDeleteComment } from "@/lib/hooks/useComments"
import { ArrowLeft, Calendar, User, FolderKanban, MessageSquare, Trash2 } from "lucide-react"
import { TaskStatus } from "@/types/task"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import { formatDistanceToNow } from "date-fns"

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: "bg-gray-100 text-gray-800",
  [TaskStatus.InProgress]: "bg-blue-100 text-blue-800",
  [TaskStatus.Blocked]: "bg-red-100 text-red-800",
  [TaskStatus.Completed]: "bg-green-100 text-green-800",
  [TaskStatus.Cancelled]: "bg-gray-100 text-gray-800",
}

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: "To Do",
  [TaskStatus.InProgress]: "In Progress",
  [TaskStatus.Blocked]: "Blocked",
  [TaskStatus.Completed]: "Completed",
  [TaskStatus.Cancelled]: "Cancelled",
}

export default function TaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = parseInt(params.id as string)
  const { user } = useAuthStore()
  const [commentText, setCommentText] = useState("")

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  })

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', task?.projectId],
    queryFn: () => projectsApi.getById(task!.projectId),
    enabled: !!task?.projectId,
  })

  // Fetch assigned user
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const assignedUser = users?.find(u => u.userId === task?.assignedToUserId)

  // Fetch comments
  const { data: commentsData, isLoading: commentsLoading } = useComments(taskId)

  // Create comment mutation
  const createCommentMutation = useCreateComment()

  // Delete comment mutation
  const deleteCommentMutation = useDeleteComment()

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        taskId,
        data: { message: commentText },
      })
      setCommentText("")
      toast.success("Comment added successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteCommentMutation.mutateAsync(commentId)
      toast.success("Comment deleted successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = task && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading task details...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">Task not found</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={TASK_STATUS_COLORS[task.status]}>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({commentsData?.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? "Adding..." : "Add Comment"}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mt-6">
                {commentsLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading comments...
                  </div>
                ) : commentsData?.comments && commentsData.comments.length > 0 ? (
                  commentsData.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {comment.createdByUserName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {comment.createdByUserName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {user?.id === comment.createdByUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap pl-10">
                        {comment.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FolderKanban className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Project:</span>
                </div>
                <p className="font-medium pl-6">{project?.name || "Loading..."}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Assigned To:</span>
                </div>
                <p className="font-medium pl-6">
                  {assignedUser?.userName || "Unassigned"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Due Date:</span>
                </div>
                <p className={`font-medium pl-6 ${isOverdue ? 'text-red-600' : ''}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                </div>
                <p className="font-medium pl-6">{formatDate(task.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
