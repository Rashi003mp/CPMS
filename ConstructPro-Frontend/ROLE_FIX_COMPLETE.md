# Role Display Fix - Complete Solution

## Problem Identified
The sidebar was showing "Project Manager" for all users, including admins. This was caused by corrupted localStorage data from previous implementations.

## Root Cause
1. Previous code versions may have stored incorrect roleId values
2. localStorage persists between code changes
3. Type coercion issues with roleId (string vs number)

## Solution Applied

### 1. Enhanced JWT Decoding (`lib/api/auth.ts`)
- Added strict type validation for roleId
- Improved error handling and logging
- Added validation to ensure roleId is a number between 0-3
- Better console logging with emojis for easy debugging

### 2. Auth Store Validation (`store/authStore.ts`)
- Added migration logic in `initializeAuth()`
- Validates roleId type on app load
- Automatically clears corrupted auth data
- Enhanced logging for debugging

### 3. Sidebar Display (`app/(dashboard)/layout.tsx`)
- Comprehensive logging of user state
- Proper type checking for roleId
- Dynamic role label display using ROLE_LABELS constant
- Admin-only "Approvals" menu (only shows when roleId === 0)

## How to Test

### Step 1: Clear All Cached Data
```javascript
// Open browser console (F12) and run:
localStorage.clear()
sessionStorage.clear()
```

### Step 2: Hard Refresh
Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Step 3: Login with Admin
- Email: `admin@gmail.com`
- Password: `Admin@123`

### Step 4: Check Console Logs
You should see logs like:
```
🔍 JWT Decoded: { ... }
📋 Extracted Claims: { userId: "1", userName: "Admin", userRole: "Admin" }
🎭 Role Mapping: { roleString: "Admin", roleId: 0, roleIdType: "number" }
✅ Final User Object: { id: 1, name: "Admin", roleId: 0, ... }
✅ User will see role: Admin
✅ Is Admin? true
🔄 Initializing Auth State: { hasToken: true, hasUser: true, userRoleId: 0 }
👤 Sidebar Render - User Info: { roleId: 0, isAdmin: true, roleLabel: "Admin" }
```

### Step 5: Verify Sidebar
- User name should show: "Admin"
- Role should show: "Admin" (not "Project Manager")
- "Approvals" menu item should be visible

### Step 6: Test Other Roles
Login with different users to verify:
- Project Manager (roleId: 1) → Shows "Project Manager", NO Approvals menu
- Site Engineer (roleId: 2) → Shows "Site Engineer", NO Approvals menu
- Client (roleId: 3) → Shows "Client", NO Approvals menu

## Backend Role Mapping
The backend generates JWT tokens with these role strings:
```csharp
0 => "Admin"
1 => "ProjectManager"
2 => "SiteEngineer"
3 => "Client"
```

## Frontend Role Mapping
The frontend maps these to roleId numbers:
```typescript
{
  'Admin': 0,
  'ProjectManager': 1,
  'SiteEngineer': 2,
  'Client': 3,
}
```

## Display Labels
```typescript
{
  0: 'Admin',
  1: 'Project Manager',
  2: 'Site Engineer',
  3: 'Client',
}
```

## Troubleshooting

### If you still see "Project Manager" for admin:
1. Check console logs - look for the 👤 emoji logs
2. Verify `roleId` is `0` (number, not string "0")
3. Clear localStorage again: `localStorage.clear()`
4. Close all browser tabs and reopen
5. Try incognito/private browsing mode

### If "Approvals" menu doesn't show for admin:
1. Check console log: `willShowApprovals` should be `true`
2. Verify `isAdmin` is `true`
3. Verify `user.roleId === 0` (strict equality)

### If role shows as "No Role":
1. Check if `user.roleId` is undefined or null
2. Check console logs for JWT decoding errors
3. Verify backend is returning valid JWT token

## Key Changes Made
1. ✅ Added Role type import in auth.ts
2. ✅ Enhanced getRoleId() with better error handling
3. ✅ Added roleId validation in login flow
4. ✅ Added migration logic in authStore.initializeAuth()
5. ✅ Enhanced console logging throughout
6. ✅ Improved sidebar role display logic

## Next Steps
After clearing localStorage and logging in fresh, the role display should work correctly for all user types. The console logs will help identify any remaining issues.
