# How to Access Admin Approvals Page

## Quick Access

**URL**: `http://localhost:3000/dashboard/admin/approvals`

**Or**: Click "Approvals" in the sidebar (only visible to admin users)

---

## Step-by-Step Guide

### Method 1: Via Sidebar Menu (Recommended)

1. **Login as Admin**:
   - Email: `admin@gmail.com`
   - Password: `Admin@123`

2. **Check Sidebar**:
   - Look for "Approvals" menu item
   - Should appear below "Users"
   - Has a CheckSquare icon

3. **Click "Approvals"**:
   - Opens the approvals page
   - Shows pending registration requests

### Method 2: Direct URL

1. **Login as Admin** (if not already logged in)

2. **Navigate directly**:
   - Type in browser: `http://localhost:3000/dashboard/admin/approvals`
   - Press Enter

3. **Page loads**:
   - Shows pending registrations
   - Can approve users

---

## Troubleshooting

### Issue: "Approvals" Menu Not Showing

**Possible Causes**:
1. Not logged in as admin
2. User roleId not set correctly
3. Browser cache issue

**Solutions**:

#### Solution 1: Verify Admin Role

1. Open browser console (F12)
2. Look for debug log: `User role check: { user, roleId, isAdmin }`
3. Check if:
   - `roleId` is `0` (admin)
   - `isAdmin` is `true`

If roleId is not 0:
- Clear browser storage
- Logout and login again
- Check JWT token decoding

#### Solution 2: Clear Storage and Re-login

```bash
# In browser console (F12):
localStorage.clear()
# Then refresh and login again
```

#### Solution 3: Check User Object

```javascript
// In browser console:
JSON.parse(localStorage.getItem('auth-storage'))
// Should show user with roleId: 0
```

### Issue: Page Shows 404

**Solution**: The page exists at `/dashboard/admin/approvals` (not `/admin/approvals`)

Correct URLs:
- ✅ `http://localhost:3000/dashboard/admin/approvals`
- ❌ `http://localhost:3000/admin/approvals`

### Issue: Page Loads But Shows Empty

**Possible Causes**:
1. No pending registrations
2. API not returning data
3. Network error

**Solutions**:

1. **Create Test Registration**:
   - Logout
   - Go to `/register`
   - Fill form and submit
   - Login as admin again
   - Check approvals page

2. **Check Network Tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Look for: `GET /api/admin-registration/requests/pending`
   - Check response

3. **Check Console for Errors**:
   - Look for any error messages
   - Check if API call failed

---

## What You Should See

### When Logged in as Admin

**Sidebar Menu**:
```
Dashboard
Projects
Tasks
Users
Approvals  ← This should be visible
```

**Approvals Page**:
- Title: "Pending Approvals"
- Badge showing count of pending requests
- Table with columns:
  - Name
  - Email
  - Phone
  - Role
  - Details (experience/skills/project)
  - Submitted (time ago)
  - Action (Approve button)

### When Logged in as Non-Admin

**Sidebar Menu**:
```
Dashboard
Projects
Tasks
Users
(No Approvals menu)
```

**Direct URL Access**:
- Page will load (no protection yet)
- But menu item won't show

---

## Testing the Approvals Flow

### Complete Test Scenario

1. **Create Test Registration**:
   ```
   - Logout
   - Go to /register
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Role: Site Engineer
   - Skills: Testing, QA
   - Submit
   ```

2. **Login as Admin**:
   ```
   - Email: admin@gmail.com
   - Password: Admin@123
   ```

3. **Navigate to Approvals**:
   ```
   - Click "Approvals" in sidebar
   - OR go to /dashboard/admin/approvals
   ```

4. **Verify Pending Request Shows**:
   ```
   - Should see "Test User" in table
   - Details should show "Skills: Testing, QA"
   - Submitted time should show (e.g., "2 minutes ago")
   ```

5. **Approve the Request**:
   ```
   - Click "Approve" button
   - Should see success toast
   - User disappears from list
   ```

6. **Verify User Created**:
   ```
   - Go to "Users" page
   - Search for "Test User"
   - Should appear in users list
   ```

---

## API Endpoint

The approvals page uses:

**GET** `/api/admin-registration/requests/pending`
- Returns array of pending registration requests
- Requires admin authentication

**POST** `/api/admin-registration/requests/{id}/approve`
- Approves a registration request
- Creates user account
- Sends notification email
- Requires admin authentication

---

## Role IDs Reference

```typescript
Admin = 0           // ← Can see Approvals
ProjectManager = 1  // Cannot see Approvals
SiteEngineer = 2    // Cannot see Approvals
Client = 3          // Cannot see Approvals
```

---

## Debug Checklist

If Approvals menu not showing:

- [ ] Logged in as admin?
- [ ] Check console for "User role check" log
- [ ] Verify roleId is 0
- [ ] Verify isAdmin is true
- [ ] Clear browser storage and re-login
- [ ] Check localStorage auth-storage
- [ ] Hard refresh (Ctrl+Shift+R)

If page not loading:

- [ ] Check URL is correct
- [ ] Backend running?
- [ ] Check Network tab for API call
- [ ] Check console for errors
- [ ] Verify authentication token

---

**Quick Access**: Just type `/dashboard/admin/approvals` in the URL bar after logging in as admin!
