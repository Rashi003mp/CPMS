# All Tasks Page - React Hooks Error Fixed

## Issue
The tasks page was showing "Rendered more hooks than during the previous render" error.

## Root Cause
The initial implementation was conditionally creating `useQuery` hooks based on the `projectIds` array, which violated React's rules of hooks.

## Solution Applied
Changed the implementation to use a single `useQuery` with `Promise.all`:

```typescript
const { data: allTasksData, isLoading: tasksLoading } = useQuery({
  queryKey: ['all-tasks'],
  queryFn: async () => {
    if (!projectsData?.items) return []
    
    const taskPromises = projectsData.items.map(project =>
      tasksApi.getByProject(project.id).catch(() => [])
    )
    
    const tasksArrays = await Promise.all(taskPromises)
    return tasksArrays.flat()
  },
  enabled: !!projectsData?.items && projectsData.items.length > 0,
})
```

## Key Features
1. **Statistics Cards**: Shows Total, To Do, In Progress, Completed, and Overdue counts
2. **Search**: Searches task title and description
3. **Status Filter**: Dropdown to filter by task status
4. **Task Cards**: Display task details with:
   - Title and status badge
   - Overdue badge (if applicable)
   - Description (truncated to 2 lines)
   - Project name
   - Assigned user name
   - Due date
5. **Edit Modal**: Click any task to open edit modal

## Additional Fixes
- Removed unused `Button` import
- All diagnostics passing
- Light theme consistent throughout

## Testing
The page should now:
- Load without React hooks errors
- Display all tasks from all projects
- Show accurate statistics
- Allow searching and filtering
- Open edit modal when clicking tasks

## Files Modified
- `CPMS/ConstructPro-Frontend/app/(dashboard)/dashboard/tasks/page.tsx`
