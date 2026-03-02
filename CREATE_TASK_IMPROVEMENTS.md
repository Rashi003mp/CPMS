# Create Task Modal - Improvements Complete

## Changes Made

### 1. Show Only Project-Assigned Users
**Problem**: The "Assign To" dropdown was showing all users in the system, not just users assigned to the current project.

**Solution**: 
- Fetch project details to get assigned users (PM and SEs)
- Fetch all users to map names to user IDs
- Build a filtered list of only project-assigned users
- Display users with their roles (Project Manager / Site Engineer)

### 2. Updated Color Theme to Light
**Problem**: Modal was using dark theme (slate-900 background) which didn't match the light theme of the project dashboard.

**Solution**:
- Removed all dark theme classes (`bg-slate-900`, `bg-slate-800`, `border-slate-700`, etc.)
- Changed to light theme matching the rest of the application
- Updated button styling to use proper blue colors
- Added explicit white background to SelectContent

## Implementation Details

### User Filtering Logic

```typescript
// Fetch project details
const { data: project } = useQuery({
  queryKey: ['project', projectId.toString()],
  queryFn: () => projectsApi.getById(projectId),
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

### Dropdown Display

```typescript
<Select
  value={formData.assignedToUserId}
  onValueChange={(value) =>
    setFormData({ ...formData, assignedToUserId: value })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select project user" />
  </SelectTrigger>
  <SelectContent className="bg-white">
    {projectUsers.length === 0 ? (
      <SelectItem value="none" disabled>
        No users assigned to this project
      </SelectItem>
    ) : (
      projectUsers.map((user) => (
        <SelectItem key={user.id} value={user.id.toString()}>
          {user.name} ({user.role})
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
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

### 1. Project-Specific User List
- Only shows users assigned to the current project
- Displays user role in parentheses
- Shows helpful message if no users assigned

### 2. Role Display
- Project Manager: Shows as "Name (Project Manager)"
- Site Engineer: Shows as "Name (Site Engineer)"
- Clear identification of user roles

### 3. Empty State Handling
- If no users assigned to project, shows: "No users assigned to this project"
- Prevents task creation without assigned users

### 4. Light Theme
- Clean white background
- Consistent with project dashboard theme
- Blue accent colors for primary actions
- Proper contrast and readability

## User Experience

### Creating a Task:
1. Click "CREATE TASK" button on project dashboard
2. Modal opens with light theme
3. Fill in task title (required)
4. Add description (optional)
5. Select user from project-assigned users dropdown
   - Shows only PM and SEs assigned to this project
   - Displays role for clarity
6. Select due date (required)
7. Select status (defaults to "To Do")
8. Click "Create Task"

### Dropdown Behavior:
- Shows "Select project user" placeholder
- Lists only users assigned to the project
- Format: "User Name (Role)"
- If no users: Shows disabled message

## Benefits

1. **Relevant Users Only**: No confusion with system-wide user list
2. **Role Clarity**: Users can see who is PM vs SE
3. **Better UX**: Matches the light theme of the dashboard
4. **Validation**: Prevents assigning tasks to non-project users
5. **Clear Feedback**: Shows when no users are available

## API Calls

### Get Project Details
```
GET https://localhost:7188/api/Projects/{projectId}
```

Returns project with:
- `projectManagerName`
- `siteEngineerName[]`

### Get All Users
```
GET https://localhost:7188/api/User/GetAllUsers
```

Returns users with:
- `userId`
- `userName`
- `email`
- `roleName`

### Create Task
```
POST https://localhost:7188/api/CreateTask
```

Request:
```json
{
  "projectId": 5010,
  "title": "Install plumbing",
  "description": "Install all bathroom fixtures",
  "assignedToUserId": 5009,
  "dueDate": "2026-03-15",
  "status": 0
}
```

## Testing

### Test with Assigned Users:
1. Navigate to project with assigned PM/SE
2. Click "CREATE TASK"
3. Verify dropdown shows only project users
4. Verify roles are displayed
5. Create task successfully

### Test with No Assigned Users:
1. Navigate to project with no assigned users
2. Click "CREATE TASK"
3. Verify dropdown shows "No users assigned" message
4. Verify task cannot be created without user

### Test Theme:
1. Open create task modal
2. Verify light background (white)
3. Verify inputs have proper styling
4. Verify buttons use blue colors
5. Verify dropdown has white background

## Files Modified

1. `components/tasks/create-task-modal.tsx`
   - Added project data fetching
   - Added user filtering logic
   - Removed dark theme classes
   - Updated dropdown to show project users only
   - Added role display in dropdown
   - Added empty state handling

## Notes

- Modal now fetches project data when opened (`enabled: isOpen`)
- User lookup matches by `userName` (same as unassign/replace logic)
- Light theme matches the overall application design
- Dropdown shows clear role information for better UX
- Handles edge case of projects with no assigned users
