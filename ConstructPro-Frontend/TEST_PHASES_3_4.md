# Testing Guide - Phases 3 & 4

## Prerequisites

✅ Backend running on: `https://localhost:7188`  
✅ Frontend running on: `http://localhost:3000`  
✅ Admin credentials: `admin@gmail.com` / `Admin@123`

---

## Test 1: Dashboard Navigation

1. Login as admin
2. Verify sidebar shows:
   - Dashboard
   - Projects
   - Tasks
   - Users
   - Approvals (admin only!)
3. Click each menu item
4. Verify navigation works
5. Check user profile section shows:
   - Avatar with first letter
   - User name
   - Role: "Admin"

**Expected**: All navigation items work, admin sees "Approvals" menu

---

## Test 2: Users List Page

1. Click "Users" in sidebar
2. Should see table with columns:
   - Name
   - Email
   - Phone
   - Role
   - Status
3. Verify at least admin user is shown
4. Check role badge shows "Admin"
5. Check status badge shows "Active"

**Expected**: Users table displays with real data from API

---

## Test 3: Search Functionality

1. On Users page, find search box
2. Type "admin" in search
3. Table should filter to show only admin
4. Clear search
5. Try searching by email
6. Try partial matches

**Expected**: Real-time search filtering works

---

## Test 4: Create Test Registration

1. Logout (click Logout button in sidebar)
2. Go to `/register`
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Role: Site Engineer
   - Skills: Testing, QA
4. Click "Submit Registration"
5. Should see success message
6. Should redirect to login

**Expected**: Registration submitted successfully

---

## Test 5: Admin Approvals Page

1. Login as admin again
2. Click "Approvals" in sidebar
3. Should see the test registration from Test 4
4. Verify details shown:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Role: SiteEngineer
   - Skills: Testing, QA
   - Submitted time (e.g., "2 minutes ago")
5. Click "Approve" button
6. Should see success toast
7. Registration should disappear from list

**Expected**: Approval works, user removed from pending list

---

## Test 6: Verify Approved User

1. Go back to "Users" page
2. Search for "Test User"
3. Should now see the approved user in the table
4. Verify details match the registration

**Expected**: Approved user appears in users list

---

## Test 7: Mobile Responsive

1. Resize browser to mobile width (< 768px)
2. Sidebar should hide
3. Hamburger menu icon should appear
4. Click hamburger
5. Sidebar should slide in from left
6. Backdrop should appear
7. Click backdrop or X button
8. Sidebar should close

**Expected**: Mobile menu works smoothly

---

## Test 8: Empty States

1. If no pending registrations:
   - Go to Approvals page
   - Should see friendly empty state with icon
2. Try searching for non-existent user:
   - Go to Users page
   - Search for "zzzzz"
   - Should see "No users found" message

**Expected**: Empty states display correctly

---

## Test 9: Loading States

1. Refresh Users page
2. Should briefly see loading spinner
3. Same for Approvals page

**Expected**: Loading spinners show while fetching data

---

## Test 10: Role-Based Access

1. Create another test user with role "Client"
2. Approve it
3. Logout
4. Login as the client user
5. Check sidebar - should NOT see "Approvals" menu
6. Try accessing `/dashboard/admin/approvals` directly
7. Should still load (we'll add protection later)

**Expected**: Admin menu items only show for admin

---

## Common Issues

### Issue: Users page shows empty
**Solution**: 
- Check backend is running
- Check browser console for errors
- Verify API URL in `.env.local`

### Issue: Approvals page shows empty
**Solution**:
- Create a test registration first
- Check you're logged in as admin
- Refresh the page

### Issue: Search not working
**Solution**:
- Check you're typing in the search box
- Try clearing and typing again
- Check browser console for errors

### Issue: Approve button doesn't work
**Solution**:
- Check backend is running
- Check browser console for errors
- Verify you're logged in as admin

---

## API Calls to Verify

Open browser DevTools (F12) → Network tab:

1. **Users Page**:
   - Should see: `GET /api/user/GetAllUsers`
   - Status: 200
   - Response: Array of users

2. **Approvals Page**:
   - Should see: `GET /api/admin-registration/requests/pending`
   - Status: 200
   - Response: Array of pending registrations

3. **Approve Action**:
   - Should see: `POST /api/admin-registration/requests/{id}/approve`
   - Status: 200
   - Response: Success message

---

## Success Checklist

- [ ] Dashboard navigation works
- [ ] Users list displays correctly
- [ ] Search filters users in real-time
- [ ] Can create test registration
- [ ] Approvals page shows pending requests
- [ ] Can approve registrations
- [ ] Approved users appear in users list
- [ ] Mobile menu works
- [ ] Empty states display
- [ ] Loading states show
- [ ] Admin-only menu items work

---

**All tests passing?** ✅ Phases 3 & 4 are working perfectly!

**Found issues?** Check the Common Issues section or browser console for errors.
