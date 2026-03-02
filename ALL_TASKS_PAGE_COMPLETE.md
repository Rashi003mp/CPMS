# All Tasks Page - Implementation Complete

## Overview
Implemented a comprehensive tasks page in the admin dashboard that displays all tasks across all projects with filtering, search, and statistics.

## Features Implemented

### 1. Task Aggregation
- Fetches all projects
- Fetches tasks for each project
- Combines all tasks into a single view
- Sorts by creation date (newest first)

### 2. Statistics Dashboard
Five stat cards showing:
- **Total Tasks**: All tasks across all projects
- **To Do**: Tasks with Todo status
- **In Progress**: Tasks currently being worked on
- **Completed**: Finished tasks
- **Overdue**: Tasks past due date and not completed

### 3. Search & Filter
- **Search Bar**: Search by task title or description
- **Status Filter**: Filter by task status
  - All Status
  - To Do
  - In Progress
  - Blocked
  - Completed
  - Cancelled

### 4. Task List Display
Each task card shows:
- Task title
- Status badge with color coding
- Overdue badge (if applicable)
- Description (truncated to 2 lines)
- Project name
- Assigned user name
- Due date

### 5. Task Editing
- Click any task to open edit modal
- Edit modal uses light theme
- Shows only project-assigned users
- Full CRUD functionality

## Implementation Details

### Data Fetching Strategy

```typescript
// Fetch all projects
const { data: projectsData } = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectsApi.getAll(1, 100),
})

// Fetch all users for name mapping
const { data: allUsers } = useQuery({
  queryKey: ['users'],
  queryFn: () => usersApi.getAll(),
})

// Fetch tasks for each project
const projectIds = projectsData?.items?.map(p => p.id) || []
const tasksQueries = projectIds.map(projectId => 
  useQuery({
    queryKey: ['project-tasks', projectId.toString()],
    queryFn: () => tasksApi.getByProject(projectId),
    enabled: projectIds.length > 0,
  })
)

// Combine all tasks
const allTasks = tasksQueries
  .flatMap(query => query.data || [])
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
```

### Statistics Calculation

```typescript
const stats = {
  total: allTasks.length,
  todo: allTasks.filter(t => t.status === TaskStatus.Todo).length,
  inProgress: allTasks.filter(t => t.status === TaskStatus.InProgress).length,
  completed: allTasks.filter(t => t.status === TaskStatus.Completed).length,
  overdue: allTasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Completed
  ).length,
}
```

### Filtering Logic

```typescript
const filteredTasks = allTasks.filter(task => {
  const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesStatus = statusFilter === 'all' || task.status.toString() === statusFilter
  return matchesSearch && matchesStatus
})
```

### Helper Functions

```typescript
// Get project name from ID
const getProjectName = (projectId: number) => {
  return projectsData?.items?.find(p => p.id === projectId)?.name || 'Unknown Project'
}

// Get user name from ID
const getUserName = (userId: number) => {
  return allUsers?.find(u => u.userId === userId)?.userName || 'Unknown User'
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Check if overdue
const isOverdue = (dueDate: string, status: TaskStatus) => {
  return new Date(dueDate) < new Date() && status !== TaskStatus.Completed
}
```

## UI Components

### Statistics Cards
```tsx
<div className="grid grid-cols-5 gap-4">
  <Card>
    <CardContent className="p-4">
      <div className="text-sm text-gray-600">Total Tasks</div>
      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
    </CardContent>
  </Card>
  {/* More stat cards... */}
</div>
```

### Search & Filter Bar
```tsx
<div className="flex items-center gap-4">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" />
    <Input
      placeholder="Search tasks..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    {/* Status options */}
  </Select>
</div>
```

### Task Card
```tsx
<div
  onClick={() => setSelectedTask(task)}
  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
>
  <div className="flex items-center gap-3 mb-2">
    <h3 className="font-semibold">{task.title}</h3>
    <Badge className={TASK_STATUS_COLORS[task.status]}>
      {TASK_STATUS_LABELS[task.status]}
    </Badge>
    {isOverdue(task.dueDate, task.status) && (
      <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    )}
  </div>
  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
  <div className="flex items-center gap-4 text-sm text-gray-500">
    <span><FolderKanban /> {getProjectName(task.projectId)}</span>
    <span><User /> {getUserName(task.assignedToUserId)}</span>
    <span><Calendar /> Due: {formatDate(task.dueDate)}</span>
  </div>
</div>
```

## Color Coding

### Status Badges
- **To Do**: Gray (`bg-gray-100 text-gray-800`)
- **In Progress**: Blue (`bg-blue-100 text-blue-800`)
- **Blocked**: Red (`bg-red-100 text-red-800`)
- **Completed**: Green (`bg-green-100 text-green-800`)
- **Cancelled**: Gray (`bg-gray-100 text-gray-800`)

### Overdue Badge
- Red (`bg-red-100 text-red-800`)

### Statistics Cards
- Total: Gray (`text-gray-900`)
- To Do: Gray (`text-gray-600`)
- In Progress: Blue (`text-blue-600`)
- Completed: Green (`text-green-600`)
- Overdue: Red (`text-red-600`)

## User Experience

### Viewing Tasks:
1. Navigate to Tasks page from sidebar
2. See statistics at the top
3. Use search bar to find specific tasks
4. Use status filter to narrow down results
5. Click any task to edit

### Searching:
- Type in search bar
- Searches both title and description
- Real-time filtering

### Filtering by Status:
- Select status from dropdown
- Combines with search filter
- Shows count of filtered tasks

### Editing Tasks:
- Click task card
- Edit modal opens with light theme
- Make changes
- Save updates
- Task list refreshes automatically

## Performance Considerations

### Parallel Queries
- Uses React Query to fetch tasks for all projects in parallel
- Efficient data loading with automatic caching
- Loading states handled gracefully

### Optimizations
- Tasks sorted once after fetching
- Filtering done in memory (fast)
- User and project name lookups cached

## Empty States

### No Tasks
```
No tasks available
```

### No Filtered Results
```
No tasks found matching your filters
```

### Loading State
- Shows spinner while fetching data
- Centered in content area

## Benefits

1. **Centralized View**: See all tasks across all projects in one place
2. **Quick Statistics**: At-a-glance overview of task status
3. **Powerful Search**: Find tasks quickly by title or description
4. **Flexible Filtering**: Filter by status to focus on specific tasks
5. **Easy Editing**: Click to edit any task
6. **Overdue Tracking**: Clearly identifies overdue tasks
7. **Project Context**: Shows which project each task belongs to
8. **User Assignment**: Shows who is assigned to each task

## API Calls

### Get All Projects
```
GET https://localhost:7188/api/Projects?page=1&pageSize=100
```

### Get All Users
```
GET https://localhost:7188/api/User/GetAllUsers
```

### Get Tasks by Project (for each project)
```
GET https://localhost:7188/api/CreateTask/project/{projectId}
```

## Files Modified

1. `app/(dashboard)/dashboard/tasks/page.tsx`
   - Complete rewrite from placeholder
   - Added task aggregation logic
   - Added statistics calculation
   - Added search and filter functionality
   - Added task list display
   - Integrated edit task modal
   - Added helper functions for data mapping

## Testing

### Test Statistics:
1. Navigate to Tasks page
2. Verify stat cards show correct counts
3. Create/complete tasks and verify updates

### Test Search:
1. Type in search bar
2. Verify tasks filter by title
3. Verify tasks filter by description
4. Clear search and verify all tasks show

### Test Status Filter:
1. Select different statuses
2. Verify only matching tasks show
3. Combine with search
4. Select "All Status" to reset

### Test Task Editing:
1. Click any task card
2. Edit modal opens
3. Make changes
4. Save and verify updates
5. Verify task list refreshes

### Test Overdue Detection:
1. Create task with past due date
2. Verify "Overdue" badge appears
3. Complete task
4. Verify "Overdue" badge disappears

## Notes

- Page fetches tasks from all projects (no backend endpoint for all tasks)
- Uses parallel queries for efficient loading
- Task count shown in header: "Tasks (X)"
- Click task card to edit (no separate edit button needed)
- Light theme consistent with rest of application
- Responsive grid layout for statistics
- Smooth hover effects on task cards
