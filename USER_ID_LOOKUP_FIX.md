# User ID Lookup Fix - Replace & Unassign Functionality

## Problem
When trying to unassign or replace users, the API returned:
```json
{
  "success": false,
  "message": "User assignment not found",
  "traceId": null,
  "statusCode": 400
}
```

## Root Cause
The backend service `UnassignUserAsync` looks up user assignments using:
- `ProjectId`
- `AssignedUserId` 
- `RoleId`

However, the frontend was passing `userId: 0` because:
1. Backend hasn't been restarted to return the new `projectManagerId` and `siteEngineerId` fields
2. The fallback value `|| 0` was being used when IDs weren't available
3. Backend couldn't find assignment with `userId: 0`

## Solution
Implemented dynamic user ID lookup that:
1. Checks if user ID is available (not 0)
2. If not available, fetches all users from `/api/User/GetAllUsers`
3. Finds the user by matching `userName`
4. Uses the actual `userId` for the operation
5. Shows error if user not found

## Implementation

### Updated Functions
**File**: `app/(dashboard)/projects/[id]/page.tsx`

#### handleUnassign
```typescript
const handleUnassign = async (userId: number, userName: string, roleId: number) => {
  // If userId is 0 (not available from backend), fetch it from users list
  let actualUserId = userId
  if (userId === 0) {
    try {
      const users = await usersApi.getAll()
      const user = users.find(u => u.userName === userName)
      if (user) {
        actualUserId = user.userId
      } else {
        toast.error('Could not find user ID. Please restart the backend.')
        return
      }
    } catch (error) {
      toast.error('Failed to fetch user information')
      return
    }
  }

  const reason = prompt(`Please provide a reason for unassigning ${userName}:`)
  if (reason && reason.trim()) {
    unassignMutation.mutate({ userId: actualUserId, roleId, reason: reason.trim() })
  }
}
```

#### handleReplace
```typescript
const handleReplace = async (userId: number, userName: string, roleId: number, roleName: string) => {
  // If userId is 0 (not available from backend), fetch it from users list
  let actualUserId = userId
  if (userId === 0) {
    try {
      const users = await usersApi.getAll()
      const user = users.find(u => u.userName === userName)
      if (user) {
        actualUserId = user.userId
      } else {
        toast.error('Could not find user ID. Please restart the backend.')
        return
      }
    } catch (error) {
      toast.error('Failed to fetch user information')
      return
    }
  }

  setReplaceUserData({ userId: actualUserId, userName, roleId, roleName })
}
```

### Added Import
```typescript
import { usersApi } from '@/lib/api/users'
```

## How It Works

### Scenario 1: Backend Restarted (User IDs Available)
1. User clicks Unassign/Replace
2. `userId` is passed from `project.projectManagerId` or `project.siteEngineerId[idx]`
3. Function uses the ID directly
4. API call succeeds

### Scenario 2: Backend Not Restarted (User IDs = 0)
1. User clicks Unassign/Replace
2. `userId` is 0 (fallback value)
3. Function detects `userId === 0`
4. Fetches all users from API
5. Finds user by matching `userName`
6. Uses actual `userId` from lookup
7. API call succeeds

### Scenario 3: User Not Found
1. User clicks Unassign/Replace
2. `userId` is 0
3. Fetches all users
4. User not found in list
5. Shows error toast: "Could not find user ID. Please restart the backend."
6. Operation cancelled

## Benefits

1. **Works Without Backend Restart**: Functions correctly even before backend restart
2. **Graceful Degradation**: Falls back to user lookup when IDs not available
3. **Error Handling**: Clear error messages if lookup fails
4. **Future-Proof**: Will use direct IDs once backend is restarted
5. **No Breaking Changes**: Maintains compatibility with both scenarios

## API Calls

### GetAllUsers
```
GET https://localhost:7188/api/User/GetAllUsers
```

Returns:
```json
[
  {
    "userId": 5009,
    "userName": "Admin",
    "email": "admin@gmail.com",
    "activeProjectCount": 1,
    "roleName": "Admin",
    "isActive": true
  }
]
```

### UnassignUser
```
POST https://localhost:7188/api/ProjectUsers/unassign-user
```

Request:
```json
{
  "projectId": 5010,
  "userId": 5009,  // Now uses actual ID from lookup
  "roleId": 1,
  "reason": "Reassignment"
}
```

### ReplaceUser
```
POST https://localhost:7188/api/ProjectUsers/replace-user
```

Request:
```json
{
  "projectId": 5010,
  "oldUserId": 5009,  // Now uses actual ID from lookup
  "newUserId": 5011,
  "roleId": 1,
  "reason": "Performance issues"
}
```

## Testing

### Test Unassign:
1. Navigate to project dashboard
2. Hover over assigned user
3. Click three-dot menu
4. Click "Unassign"
5. Enter reason
6. Verify success toast
7. Verify user removed from list

### Test Replace:
1. Navigate to project dashboard
2. Hover over assigned user
3. Click three-dot menu
4. Click "Replace"
5. Enter reason
6. Select new user
7. Click "Replace"
8. Verify success toast
9. Verify user replaced in list

## Error Messages

- **User Not Found**: "Could not find user ID. Please restart the backend."
- **API Failure**: "Failed to fetch user information"
- **Unassign Failed**: "Failed to unassign user"
- **Replace Failed**: "Failed to replace user"

## Performance

- **Additional API Call**: Only when user IDs not available (temporary)
- **Caching**: Could be improved by caching user list
- **Once Backend Restarted**: No additional API calls needed

## Files Modified

1. `app/(dashboard)/projects/[id]/page.tsx`
   - Made `handleUnassign` async
   - Made `handleReplace` async
   - Added user ID lookup logic
   - Added error handling
   - Imported `usersApi`

## Next Steps

Once backend is restarted:
1. User IDs will be available directly
2. Lookup logic will be skipped
3. Performance will be optimal
4. No code changes needed

The fix ensures functionality works in both scenarios!
