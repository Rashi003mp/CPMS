# Final Admin Role Fix - Complete Solution

## The Real Problem

The admin user in your database has `RoleId = 1` (Project Manager) instead of `RoleId = 0` (Admin).

That's why:
- ❌ Sidebar shows "Project Manager"
- ❌ Approvals menu doesn't show (when conditional)
- ❌ Admin features don't work

## Solution: Fix Database

### Option 1: Using SQL Server Management Studio (SSMS)

1. Open SSMS
2. Connect to `(localdb)\MSSQLLocalDB`
3. Open database `CPMS_DB1`
4. Run this query:

```sql
-- Check current role
SELECT Id, Name, Email, RoleId, IsActive 
FROM Users 
WHERE Email = 'admin@gmail.com';

-- Fix admin role
UPDATE Users 
SET RoleId = 0 
WHERE Email = 'admin@gmail.com';

-- Verify fix
SELECT Id, Name, Email, RoleId, IsActive 
FROM Users 
WHERE Email = 'admin@gmail.com';
```

### Option 2: Using Visual Studio

1. Open Visual Studio
2. Go to View → SQL Server Object Explorer
3. Expand (localdb)\MSSQLLocalDB → Databases → CPMS_DB1 → Tables
4. Right-click `Users` table → View Data
5. Find the admin user row
6. Change `RoleId` from `1` to `0`
7. Press Enter to save

### Option 3: Using Entity Framework Migration

Create a migration to fix the admin role:

```bash
cd CPMS/ConstructionPM.Infrastructure
dotnet ef migrations add FixAdminRole --startup-project ../ConstrictionPM.API
dotnet ef database update --startup-project ../ConstrictionPM.API
```

Then add this to the migration:

```csharp
migrationBuilder.Sql(@"
    UPDATE Users 
    SET RoleId = 0 
    WHERE Email = 'admin@gmail.com'
");
```

## After Fixing Database

1. **Logout** from the frontend
2. **Clear browser storage**:
   ```javascript
   localStorage.clear()
   ```
3. **Login again** with admin credentials
4. **Check console** for debug logs:
   - Should see `roleClaim: "Admin"`
   - Should see `User roleId: 0`
5. **Check sidebar**:
   - Should show "Admin" (not "Project Manager")
   - "Approvals" menu should be visible

## Role ID Reference

```
0 = Admin           ← What admin should be
1 = ProjectManager  ← What admin currently is (WRONG!)
2 = SiteEngineer
3 = Client
```

## Verification Steps

### Step 1: Check Database
```sql
SELECT Email, RoleId FROM Users WHERE Email = 'admin@gmail.com';
-- Expected: RoleId = 0
```

### Step 2: Check JWT Token
1. Login
2. Open console (F12)
3. Look for: `roleClaim: "Admin"`
4. If it says "ProjectManager", database wasn't fixed

### Step 3: Check Frontend
1. Look at sidebar
2. Under username, should show "Admin"
3. "Approvals" menu should be visible

### Step 4: Check localStorage
```javascript
// In console:
JSON.parse(localStorage.getItem('auth-storage'))
// user.roleId should be 0
```

## Why This Happened

When the admin user was created, it was probably created with:
- RoleId = 1 (ProjectManager) - WRONG
- Instead of RoleId = 0 (Admin) - CORRECT

The backend correctly maps:
- RoleId 0 → "Admin" role name in JWT
- RoleId 1 → "ProjectManager" role name in JWT

But if the database has RoleId = 1, the JWT will say "ProjectManager".

## Frontend Changes Made

1. **Added comprehensive debug logging** in `lib/api/auth.ts`:
   - Shows full JWT payload
   - Shows extracted role claim
   - Shows final user object
   - Shows roleId value and type

2. **Improved role display** in dashboard layout:
   - Better null checking
   - Fallback display for unknown roles
   - Shows "Role X" if role not in ROLE_LABELS

3. **Temporarily showing Approvals for all users**:
   - For debugging purposes
   - Will be conditional once role is fixed

## Quick Fix Command

If you have access to the database, run this ONE command:

```sql
UPDATE Users SET RoleId = 0 WHERE Email = 'admin@gmail.com';
```

Then logout, clear storage, and login again.

## Still Not Working?

If after fixing the database it still shows "Project Manager":

1. **Restart the backend**:
   ```bash
   # Stop current backend (Ctrl+C)
   # Start again:
   dotnet run --launch-profile https
   ```

2. **Clear ALL browser data**:
   - F12 → Application → Clear site data
   - Or use Incognito mode

3. **Check console logs**:
   - Look for `=== JWT DECODE DEBUG ===`
   - What does `roleClaim` say?
   - What does `User roleId` say?

4. **Verify database was actually updated**:
   ```sql
   SELECT * FROM Users WHERE Email = 'admin@gmail.com';
   ```

## Expected Console Output (After Fix)

```
=== JWT DECODE DEBUG ===
Full decoded JWT: { 
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role": "Admin",  ← Should say "Admin"
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Admin User",
  "exp": 1234567890
}
Extracted claims: { 
  userIdClaim: "1", 
  nameClaim: "Admin User", 
  roleClaim: "Admin",  ← Should say "Admin"
  roleClaimType: "string" 
}
✅ Created user object: { 
  id: 1, 
  name: "Admin User", 
  email: "admin@gmail.com", 
  phone: "", 
  roleId: 0,  ← Should be 0
  isActive: true 
}
✅ User roleId: 0 (0 = Admin)  ← Should be 0
=== END DEBUG ===
```

---

**The fix is simple**: Change admin user's RoleId from 1 to 0 in the database!

Run the SQL command, logout, clear storage, login again, and it will work! 🚀
