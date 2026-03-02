# Edit Task Modal - Styling & Functionality Fix

## Changes Made

### 1. Updated to Light Theme
**Problem**: Modal was using dark theme (slate-900 background) which didn't match the light theme of the application.

**Solution**:
- Removed all dark theme classes (`bg-slate-900`, `bg-slate-800`, `border-slate-700`, `text-white`)
- Changed to light theme matching the rest of the application
- Updated button styling to use proper blue colors
- Added explicit white background to SelectContent

### 2. Show Only Project-Assigned Users
**Problem**: The "Assign To" dropdown was showing all users in the system, not just users assigned to the current project.

**Solution**:
- Fetch project details using `task.projectId`
- Fetch all users to map names to user IDs
- Build a filtered list of only project-assigned users (PM and SEs)
- Display users with their roles in the dropdown

## Implementation Details

### User Filtering Logic

```typescript
// Fetch project details
const { data: project } = useQuery({
  queryKey: ['project', task.projectId.toString()],
  queryFn: () => projectsApi.getById(task.projectId),
  enabled: isOpen,
})

// Fetch all users for ID lookup
const { data: allUsers } = useQuery({
  queryKey: ['users'],
  queryFn: () => usersApi.getAll(),
  enabled: isOpen,
})

// Build project users list
const projectUsers = []
if (project && allUsers) {
  // Add project manager
  if (project.projectManagerName) {
    const pmUser = allUsers.find(u => u.userName === project.projectManagerName)
    if (pmUser) {
      projectUsers.push({
        id: pmUser.userId,
        name: pmUser.userName,
        role: 'Project Manager'
      })
    }
  }
  
  // Add site engineers
  if (project.siteEngineerName && project.siteEngineerName.length > 0) {
    project.siteEngineerName.forEach(engineerName => {
      const seUser = allUsers.find(u => u.userName === engineerName)
      if (seUser) {
        projectUsers.push({
          id: seUser.userId,
          name: seUser.userName,
          role: 'Site Engineer'
        })
      }
    })
  }
}
```

## UI Changes

### Before (Dark Theme):
```tsx
<DialogContent className="bg-slate-900 text-white border-slate-800">
  <Input className="bg-slate-800 border-slate-700" />
  <Textarea className="bg-slate-800 border-slate-700" />
  <SelectTrigger className="bg-slate-800 border-slate-700" />
  <Button className="border-slate-700" />
</DialogContent>
```

### After (Light Theme):
```tsx
<DialogContent>
  <Input />
  <Textarea />
  <SelectTrigger />
  <SelectContent className="bg-white" />
  <Button className="bg-blue-600 hover:bg-blue-700 text-white" />
</DialogContent>
```

## Features

### 1. Light Theme
- Clean white background
- Consistent with project dashboard theme
- Blue accent colors for primary actions
- Proper contrast and readability

### 2. Project-Specific User List
- Only shows users assigned to the task's project
- Displays user role in parentheses
- Shows helpful message if no users assigned
- Format: "User Name (Role)"

### 3. All Task Status Options
- To Do
- In Progress
- Blocked
- Completed
- Cancelled

## User Experience

### Editing a Task:
1. Click on a task card to open edit modal
2. Modal opens with light theme
3. All fields pre-filled with current task data
4. "Assign To" dropdown shows only project users
5. Each user displays with their role
6. Update any fields as needed
7. Click "Update Task"

### Dropdown Display:
```
John Doe (Project Manager)
Jane Smith (Site Engineer)
Bob Johnson (Site Engineer)
```

## Benefits

1. **Consistent Theme**: Matches the light theme throughout the application
2. **Relevant Users Only**: No confusion with system-wide user list
3. **Role Clarity**: Users can see who is PM vs SE
4. **Better UX**: Clean, modern interface
5. **Validation**: Prevents assigning tasks to non-project users

## Comparison with Create Task Modal

Both modals now have:
- ✅ Light theme styling
- ✅ Project-specific user filtering
- ✅ Role display in dropdown
- ✅ Blue accent buttons
- ✅ Consistent UI/UX

## Files Modified

1. `components/tasks/edit-task-modal.tsx`
   - Added project data fetching using `task.projectId`
   - Added user filtering logic
   - Removed all dark theme classes
   - Updated dropdown to show project users only
   - Added role display in dropdown
   - Added empty state handling
   - Updated button styling

## Testing

### Test Edit Task:
1. Navigate to project dashboard
2. Click on any task card
3. Edit modal opens with light theme
4. Verify all fields are pre-filled
5. Verify "Assign To" shows only project users
6. Verify roles are displayed
7. Update task successfully

### Test Theme:
1. Open edit task modal
2. Verify light background (white)
3. Verify inputs have proper styling
4. Verify buttons use blue colors
5. Verify dropdown has white background
6. Compare with create task modal - should match

## Notes

- Modal fetches project data using `task.projectId` when opened
- User lookup matches by `userName` (consistent with other modals)
- Light theme matches the overall application design
- Dropdown shows clear role information for better UX
- Handles edge case of projects with no assigned users
- All status options available (including Completed and Cancelled)
