# 🧪 Integration Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd CPMS/ConstrictionPM.API
dotnet run
```
Backend should be running on: `https://localhost:7188`

### 2. Start Frontend
```bash
cd CPMS/constructpro-frontend
npm run dev
```
Frontend should be running on: `http://localhost:3000`

### 3. Clear Cache
Open browser console (F12) and run:
```javascript
localStorage.clear()
sessionStorage.clear()
```
Then hard refresh: `Ctrl + Shift + R`

## Test Scenarios

### Scenario 1: Admin Login & Dashboard
1. Navigate to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@gmail.com`
   - Password: `Admin@123`
3. Should redirect to `/dashboard`
4. Verify:
   - ✅ Sidebar shows "Admin" role
   - ✅ "Approvals" menu is visible
   - ✅ Dashboard shows 4 stat cards
   - ✅ Stats show real numbers from backend
   - ✅ Recent projects list shows actual projects

### Scenario 2: Projects Page
1. Click "Projects" in sidebar
2. Verify:
   - ✅ Projects list loads from backend
   - ✅ Each project shows correct status badge
   - ✅ Search box filters projects
   - ✅ Pagination works if > 10 projects
   - ✅ Project cards show PM and engineers

### Scenario 3: Users Management
1. Click "Users" in sidebar
2. Verify:
   - ✅ Users table loads from backend
   - ✅ Shows all user details (name, email, role, projects)
   - ✅ Search filters users
   - ✅ Activate/Deactivate buttons work
   - ✅ Status updates immediately

### Scenario 4: Registration Approvals
1. Click "Approvals" in sidebar
2. Verify:
   - ✅ Pending registrations load from backend
   - ✅ Shows all registration details
   - ✅ Approve button works
   - ✅ Reject button prompts for reason
   - ✅ List updates after approval/rejection

### Scenario 5: Role-Based Access (Client)
1. Logout
2. Login with client credentials
3. Verify:
   - ✅ Sidebar shows "Client" role
   - ✅ No "Approvals" menu
   - ✅ Dashboard shows only 2 stat cards
   - ✅ Cannot access `/dashboard/admin/approvals`
   - ✅ Cannot access `/dashboard/users`

## API Testing

### Test Projects API
Open browser console and run:
```javascript
// Get auth token
const token = localStorage.getItem('auth_token')

// Test get projects
fetch('https://localhost:7188/api/projects?page=1&pageSize=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Projects:', d))
```

### Test Users API
```javascript
const token = localStorage.getItem('auth_token')

fetch('https://localhost:7188/api/User/GetAllUsers', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Users:', d))
```

### Test Pending Registrations
```javascript
const token = localStorage.getItem('auth_token')

fetch('https://localhost:7188/api/Registration/requests/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Pending:', d))
```

## Console Logs to Check

After login, you should see:
```
🔍 JWT Decoded: { ... }
📋 Extracted Claims: { userId: "1", userName: "Admin", userRole: "Admin" }
🎭 Role Mapping: { roleString: "Admin", roleId: 0 }
✅ Final User Object: { "roleId": 0, ... }
✅ Is Admin? true
```

On dashboard load:
```
👤 Sidebar Render - User Info: { roleId: 0, isAdmin: true, roleLabel: "Admin" }
```

## Common Issues & Fixes

### Issue: "Network Error" or "Failed to fetch"
**Fix:** Backend is not running. Start backend first.

### Issue: "401 Unauthorized"
**Fix:** Token expired or invalid. Logout and login again.

### Issue: "CORS Error"
**Fix:** Backend CORS not configured. Check `Program.cs` has:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### Issue: Still seeing "Project Manager" for admin
**Fix:** Clear cache and login again:
```javascript
localStorage.clear()
```

### Issue: Empty data on dashboard
**Fix:** Backend database might be empty. Add some test data.

### Issue: "Approvals" menu not showing for admin
**Fix:** Check console logs. Verify `roleId === 0` and `isAdmin === true`.

## Expected Results

### Admin Dashboard
```
┌─────────────────────────────────────┐
│ Total Projects: 15                  │
│ Active Projects: 8                  │
│ Total Users: 25                     │
│ Pending Approvals: 3                │
└─────────────────────────────────────┘

Recent Projects:
- Construction Site A (Active)
- Office Building B (Planned)
- Residential Complex C (Active)
```

### Projects Page
```
┌──────────────┬──────────────┬──────────────┐
│ Project A    │ Project B    │ Project C    │
│ Active       │ Planned      │ Completed    │
│ PM: John     │ PM: Sarah    │ PM: Mike     │
│ Created: ... │ Created: ... │ Created: ... │
└──────────────┴──────────────┴──────────────┘

Page 1 of 2
```

### Users Page
```
┌──────┬────────────┬──────────┬──────┬────────┐
│ Name │ Email      │ Role     │ Proj │ Status │
├──────┼────────────┼──────────┼──────┼────────┤
│ John │ john@...   │ PM       │ 5    │ Active │
│ Sara │ sara@...   │ Engineer │ 3    │ Active │
└──────┴────────────┴──────────┴──────┴────────┘
```

## Success Checklist

- [ ] Backend running on https://localhost:7188
- [ ] Frontend running on http://localhost:3000
- [ ] Admin can login
- [ ] Dashboard shows real data
- [ ] Projects page loads and works
- [ ] Users page loads and works
- [ ] Approvals page loads and works
- [ ] Role-based access works
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Activate/Deactivate works
- [ ] Approve/Reject works
- [ ] No console errors
- [ ] No TypeScript errors

---

**If all checks pass, the integration is complete and working!**
