import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/lib/api/comments'
import { Send, Loader2, User } from 'lucide-react'
import { formatDate } from '@/lib/helpers/date'
import type { Task } from '@/types/task'

interface TaskCommentsModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

export function TaskCommentsModal({ isOpen, onClose, task }: TaskCommentsModalProps) {
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')

  const { data: commentsResponse, isLoading } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: () => commentsApi.getByTask(task.id),
    enabled: isOpen,
  })

  // Ensure comments is strictly an Array.
  const comments = Array.isArray(commentsResponse?.comments) ? commentsResponse.comments : []

  const createMutation = useMutation({
    mutationFn: (message: string) => commentsApi.create(task.id, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments'] })
      setNewComment('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    createMutation.mutate(newComment)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Comments: {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[50vh] max-h-[500px]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 bg-white">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                   <User className="h-8 w-8 text-gray-300" />
                </div>
                <div className="text-gray-900 font-medium font-sm mb-1">No comments yet</div>
                <div className="text-gray-500 text-sm">Be the first to share your thoughts on this task.</div>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 relative group">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold shadow-sm border border-white">
                    {comment.createdByUserName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100">
                      <div className="font-semibold text-sm text-gray-900 mb-0.5">
                        {comment.createdByUserName || 'Unknown User'}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{comment.message}</p>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400 mt-1.5 ml-2 uppercase tracking-wide">
                      {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-2xl bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11 pr-12 focus-visible:ring-1 focus-visible:ring-blue-500"
                  disabled={createMutation.isPending}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
                disabled={!newComment.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-1" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
