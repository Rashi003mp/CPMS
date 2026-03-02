# JWT Role Detection Fixed! ✅

## Problem

Admin users were showing as "Project Manager" in the sidebar because the JWT token decoder wasn't correctly extracting the role from the .NET JWT token.

## Root Cause

.NET JWT tokens use full claim type URIs instead of short names:
- ❌ Expected: `sub`, `name`, `role`
- ✅ Actual: `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`, etc.

## Solution Applied

Updated `lib/api/auth.ts` to correctly extract claims from .NET JWT tokens:

```typescript
// Extract claims - .NET uses full claim type URIs
const userIdClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
const nameClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
const roleClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']
```

Added fallbacks for standard JWT claims:
```typescript
const userIdClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['sub']
```

Added debug logging to help troubleshoot:
```typescript
console.log('Decoded JWT:', decoded)
console.log('Extracted claims:', { userIdClaim, nameClaim, roleClaim })
console.log('Created user object:', user)
```

## How to Test

1. **Clear browser storage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear all storage
   - Or just clear localStorage

2. **Login as admin**:
   - Go to `/login`
   - Email: `admin@gmail.com`
   - Password: `Admin@123`
   - Click "Sign In"

3. **Check browser console**:
   - Should see debug logs showing:
     - Decoded JWT with full claim URIs
     - Extracted claims
     - Created user object with roleId: 0

4. **Verify in sidebar**:
   - User profile should show "Admin" (not "Project Manager")
   - "Approvals" menu item should be visible

## JWT Token Structure

Your .NET backend creates tokens like this:

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role": "Admin",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Admin User",
  "exp": 1234567890
}
```

Frontend now correctly extracts:
- User ID: 1
- Role: Admin → roleId: 0
- Name: Admin User

## Role Mapping

```typescript
const roleMap: Record<string, number> = {
  'Admin': 0,           // ✅ Now correctly detected
  'ProjectManager': 1,
  'SiteEngineer': 2,
  'Client': 3,
}
```

## Verification Steps

After logging in, check:

1. **Browser Console** (F12 → Console):
   ```
   Decoded JWT: { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role": "Admin", ... }
   Extracted claims: { userIdClaim: "1", nameClaim: "Admin User", roleClaim: "Admin" }
   Created user object: { id: 1, name: "Admin User", roleId: 0, ... }
   ```

2. **Sidebar**:
   - Role badge should show "Admin"
   - "Approvals" menu item should be visible

3. **LocalStorage** (F12 → Application → Local Storage):
   - `auth-storage` should contain user with `roleId: 0`

## If Still Not Working

1. **Hard refresh**: Ctrl+Shift+R
2. **Clear all storage**: DevTools → Application → Clear storage
3. **Check console logs**: Look for the debug output
4. **Verify token**: Copy token from localStorage and decode at jwt.io
5. **Check backend**: Verify admin user has roleId = 0 in database

---

**Status**: ✅ FIXED  
**Action**: Clear browser storage and login again  
**Expected**: Admin role correctly detected and displayed
