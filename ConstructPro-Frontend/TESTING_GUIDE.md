# Testing Guide - Phase 2 Authentication

## Prerequisites

1. **Backend Running**: Ensure your .NET backend is running on `https://localhost:7001`
2. **Frontend Running**: Start the Next.js dev server with `npm run dev`
3. **Browser**: Open `http://localhost:3000`

---

## Test Scenarios

### 1. Home Page
**URL**: `http://localhost:3000`

**Expected**:
- ✅ See ConstructPro landing page
- ✅ Hero section with logo and title
- ✅ Three feature cards displayed
- ✅ "Sign In" and "Register" buttons visible
- ✅ Clicking "Sign In" → redirects to `/login`
- ✅ Clicking "Register" → redirects to `/register`

---

### 2. Login Page
**URL**: `http://localhost:3000/login`

#### Test Case 2.1: Empty Form Submission
**Steps**:
1. Click "Sign In" button without entering anything

**Expected**:
- ✅ Email error: "Invalid email address"
- ✅ Password error: "Password must be at least 6 characters"

#### Test Case 2.2: Invalid Email
**Steps**:
1. Enter: `notanemail`
2. Enter password: `password123`
3. Click "Sign In"

**Expected**:
- ✅ Email error: "Invalid email address"

#### Test Case 2.3: Valid Login
**Steps**:
1. Enter valid email from your backend
2. Enter correct password
3. Click "Sign In"

**Expected**:
- ✅ Button shows "Signing in..." with spinner
- ✅ Success toast notification
- ✅ Redirect to `/dashboard`
- ✅ Dashboard page loads with user info

#### Test Case 2.4: Invalid Credentials
**Steps**:
1. Enter: `wrong@email.com`
2. Enter: `wrongpassword`
3. Click "Sign In"

**Expected**:
- ✅ Error toast with backend error message
- ✅ Stay on login page

#### Test Case 2.5: Show/Hide Password
**Steps**:
1. Enter password
2. Click "Show" button

**Expected**:
- ✅ Password becomes visible
- ✅ Button text changes to "Hide"
- ✅ Click again → password hidden

#### Test Case 2.6: Navigation Links
**Steps**:
1. Click "Forgot password?" link
2. Go back, click "Register here" link

**Expected**:
- ✅ Forgot password link → `/forgot-password`
- ✅ Register link → `/register`

---

### 3. Registration Page
**URL**: `http://localhost:3000/register`

#### Test Case 3.1: Form Validation
**Steps**:
1. Click "Submit Registration" without filling form

**Expected**:
- ✅ Name error shown
- ✅ Email error shown
- ✅ Phone error shown
- ✅ Role error shown

#### Test Case 3.2: Role-Specific Fields - Project Manager
**Steps**:
1. Fill basic info (name, email, phone)
2. Select role: "Project Manager"

**Expected**:
- ✅ "Years of Experience" field appears
- ✅ Other role fields hidden

#### Test Case 3.3: Role-Specific Fields - Site Engineer
**Steps**:
1. Fill basic info
2. Select role: "Site Engineer"

**Expected**:
- ✅ "Skills" field appears
- ✅ Other role fields hidden

#### Test Case 3.4: Role-Specific Fields - Client
**Steps**:
1. Fill basic info
2. Select role: "Client"

**Expected**:
- ✅ "Project Name" field appears
- ✅ Other role fields hidden

#### Test Case 3.5: Successful Registration
**Steps**:
1. Fill all required fields:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `1234567890`
   - Role: `Site Engineer`
   - Skills: `AutoCAD, Civil Engineering`
2. Click "Submit Registration"

**Expected**:
- ✅ Button shows "Submitting..." with spinner
- ✅ Success toast: "Registration submitted! Awaiting admin approval."
- ✅ Redirect to `/login`

#### Test Case 3.6: Duplicate Email
**Steps**:
1. Try registering with existing email

**Expected**:
- ✅ Error toast with backend message
- ✅ Stay on registration page

---

### 4. Forgot Password Page
**URL**: `http://localhost:3000/forgot-password`

#### Test Case 4.1: Empty Email
**Steps**:
1. Click "Send Reset Link" without email

**Expected**:
- ✅ Email error: "Invalid email address"

#### Test Case 4.2: Valid Email Submission
**Steps**:
1. Enter: `user@example.com`
2. Click "Send Reset Link"

**Expected**:
- ✅ Button shows "Sending..." with spinner
- ✅ Success state appears
- ✅ Shows: "Check Your Email"
- ✅ Displays entered email
- ✅ Shows instructions
- ✅ "Resend Email" button visible
- ✅ "Back to Login" button visible

#### Test Case 4.3: Resend Email
**Steps**:
1. After success, click "Resend Email"

**Expected**:
- ✅ Returns to form
- ✅ Can submit again

---

### 5. Reset Password Page
**URL**: `http://localhost:3000/reset-password?token=YOUR_TOKEN`

#### Test Case 5.1: Password Validation
**Steps**:
1. Enter short password: `123`
2. Click "Reset Password"

**Expected**:
- ✅ Error: "Password must be at least 6 characters"

#### Test Case 5.2: Password Mismatch
**Steps**:
1. New Password: `password123`
2. Confirm Password: `password456`
3. Click "Reset Password"

**Expected**:
- ✅ Error: "Passwords don't match"

#### Test Case 5.3: Successful Reset
**Steps**:
1. New Password: `newpassword123`
2. Confirm Password: `newpassword123`
3. Click "Reset Password"

**Expected**:
- ✅ Button shows "Resetting..." with spinner
- ✅ Success state appears
- ✅ Shows: "Password Reset!"
- ✅ Auto-redirect to login after 3 seconds

---

### 6. Protected Routes
**URL**: `http://localhost:3000/dashboard` (when not logged in)

#### Test Case 6.1: Unauthenticated Access
**Steps**:
1. Clear browser storage (logout if logged in)
2. Try to access `/dashboard`

**Expected**:
- ✅ Brief loading spinner
- ✅ Redirect to `/login`

#### Test Case 6.2: Authenticated Access
**Steps**:
1. Login successfully
2. Access `/dashboard`

**Expected**:
- ✅ Dashboard loads immediately
- ✅ No redirect

---

### 7. Dashboard
**URL**: `http://localhost:3000/dashboard` (after login)

#### Test Case 7.1: Dashboard Content
**Expected**:
- ✅ Sidebar visible on desktop
- ✅ User name in header
- ✅ Four stat cards displayed
- ✅ Recent projects section
- ✅ Upcoming tasks section

#### Test Case 7.2: Sidebar Navigation
**Steps**:
1. Click each navigation item

**Expected**:
- ✅ Dashboard → `/dashboard`
- ✅ Projects → `/dashboard/projects`
- ✅ Tasks → `/dashboard/tasks`
- ✅ Users → `/dashboard/users`

#### Test Case 7.3: Mobile Menu
**Steps**:
1. Resize browser to mobile width
2. Click hamburger menu icon

**Expected**:
- ✅ Sidebar slides in from left
- ✅ Backdrop appears
- ✅ Click backdrop → menu closes
- ✅ Click X button → menu closes

#### Test Case 7.4: User Profile Section
**Expected**:
- ✅ User avatar with first letter of name
- ✅ User full name displayed
- ✅ User role displayed (e.g., "Project Manager")

#### Test Case 7.5: Logout
**Steps**:
1. Click "Logout" button in sidebar

**Expected**:
- ✅ Redirect to `/login`
- ✅ Auth token cleared
- ✅ Cannot access `/dashboard` anymore

---

### 8. Responsive Design

#### Test Case 8.1: Mobile (< 768px)
**Expected**:
- ✅ Sidebar hidden by default
- ✅ Hamburger menu visible
- ✅ Forms stack vertically
- ✅ Cards stack in single column

#### Test Case 8.2: Tablet (768px - 1024px)
**Expected**:
- ✅ Sidebar visible
- ✅ Two-column layouts work
- ✅ Proper spacing

#### Test Case 8.3: Desktop (> 1024px)
**Expected**:
- ✅ Full sidebar always visible
- ✅ Multi-column layouts
- ✅ Optimal spacing

---

## Common Issues & Solutions

### Issue 1: Network Error
**Symptom**: "Network Error" toast
**Solution**: 
- Check backend is running on `https://localhost:7001`
- Check CORS settings in backend
- Verify API URL in `.env.local`

### Issue 2: 401 Unauthorized
**Symptom**: Automatic logout after login
**Solution**:
- Check JWT token is being stored
- Verify token format in backend
- Check token expiration time

### Issue 3: CORS Error
**Symptom**: Browser console shows CORS error
**Solution**:
- Add `http://localhost:3000` to backend CORS policy
- Ensure backend allows credentials

### Issue 4: Form Not Submitting
**Symptom**: Button click does nothing
**Solution**:
- Check browser console for errors
- Verify form validation
- Check network tab for API calls

---

## Backend Requirements

For testing to work, your backend must have:

1. **CORS Configuration**:
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

2. **Test User**: Create at least one user in the database for login testing

3. **Email Service**: Configure email settings for password recovery (or mock it)

---

## Quick Test Script

Run through this in 5 minutes:

1. ✅ Open home page → click "Sign In"
2. ✅ Try login with wrong credentials → see error
3. ✅ Login with correct credentials → reach dashboard
4. ✅ Click through navigation items
5. ✅ Click logout → back to login
6. ✅ Go to register → fill form → submit
7. ✅ Go to forgot password → submit email
8. ✅ Resize browser → test mobile menu

---

**All tests passing?** ✅ Phase 2 is working perfectly!

**Issues found?** Check the "Common Issues & Solutions" section above.
