# Edit Task API Error Fixed

## Error
```json
{
  "success": false,
  "message": "Task not found",
  "traceId": null,
  "statusCode": 400
}
```

## Root Cause
The frontend was sending incorrect field names to the backend:
1. Sending `id` instead of `taskId`
2. Missing the required `projectId` field

## Backend Expected Fields
According to `UpdateTaskDto.cs`, the backend expects:
```csharp
public class UpdateTaskDto
{
    [Required]
    public int TaskId { get; set; }      // Frontend was sending "id"
    public int? ProjectId { get; set; }   // Frontend was missing this
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? AssignedToUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DomainTaskStatus? Status { get; set; }
}
```

## Frontend Was Sending
```typescript
{
  id: 2006,                    // ❌ Should be "taskId"
  // projectId missing          // ❌ Required field
  title: "...",
  description: "...",
  assignedToUserId: 6010,
  dueDate: "2027-03-30",
  status: 1
}
```

## Solution Applied

### 1. Updated Type Definition
Changed `UpdateTaskRequest` interface in `types/task.ts`:
```typescript
export interface UpdateTaskRequest {
  taskId: number        // Changed from "id"
  projectId: number     // Added required field
  title?: string
  description?: string
  assignedToUserId?: number
  dueDate?: string
  status?: TaskStatus
}
```

### 2. Updated Edit Task Modal
Changed the mutation call in `edit-task-modal.tsx`:
```typescript
updateMutation.mutate({
  taskId: task.id,           // Changed from "id"
  projectId: task.projectId, // Added projectId
  title: formData.title,
  description: formData.description,
  assignedToUserId: parseInt(formData.assignedToUserId),
  dueDate: formData.dueDate,
  status: formData.status,
})
```

### 3. Added Query Invalidation
Added invalidation for 'all-tasks' query to refresh the all tasks page after updates.

## Files Modified
- `CPMS/constructpro-frontend/types/task.ts`
- `CPMS/constructpro-frontend/components/tasks/edit-task-modal.tsx`

## Testing
The edit task functionality should now work correctly:
1. Open any task from the all tasks page or project dashboard
2. Edit the task details
3. Click "Update Task"
4. Task should update successfully without errors
