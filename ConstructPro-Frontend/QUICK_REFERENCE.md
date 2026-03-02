# 🚀 Quick Reference Card

## Start Application

```bash
# Terminal 1 - Backend
cd CPMS/ConstrictionPM.API
dotnet run

# Terminal 2 - Frontend
cd CPMS/constructpro-frontend
npm run dev
```

## URLs
- Backend: `https://localhost:7188`
- Frontend: `http://localhost:3000`
- Cache Cleaner: `http://localhost:3000/clear-cache.html`

## Test Credentials

### Admin
```
Email: admin@gmail.com
Password: Admin@123
```

## Clear Cache (If Issues)
```javascript
localStorage.clear()
sessionStorage.clear()
```
Then: `Ctrl + Shift + R`

## Dashboard Features

### Admin Can:
✅ View all stats
✅ Manage projects
✅ Manage users
✅ Approve registrations
✅ Manage tasks

### Project Manager Can:
✅ View project stats
✅ Manage projects
✅ Approve registrations
✅ Manage tasks
❌ Manage users

### Site Engineer Can:
✅ View assigned projects
✅ Manage assigned tasks
❌ Create projects
❌ Manage users

### Client Can:
✅ View assigned projects
✅ View assigned tasks
❌ Create/Edit anything

## API Endpoints

```
Auth:     POST /api/auth/login
Projects: GET  /api/projects
Users:    GET  /api/User/GetAllUsers
Approvals: GET /api/Registration/requests/pending
Tasks:    GET  /api/CreateTask/project/{id}
```

## File Structure

```
constructpro-frontend/
├── app/
│   ├── (auth)/          # Login, Register, etc.
│   └── (dashboard)/     # Dashboard pages
├── components/ui/       # Reusable components
├── lib/
│   ├── api/            # API clients
│   └── hooks/          # React Query hooks
├── store/              # Zustand stores
└── types/              # TypeScript types
```

## Common Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## Troubleshooting

### Issue: Login fails
**Fix:** Check backend is running

### Issue: Wrong role displayed
**Fix:** Clear cache and login again

### Issue: CORS error
**Fix:** Check backend CORS configuration

### Issue: 401 Unauthorized
**Fix:** Token expired, logout and login

### Issue: Empty dashboard
**Fix:** Backend database might be empty

## Console Logs

### Successful Login:
```
✅ Final User Object: { "roleId": 0, ... }
✅ Is Admin? true
```

### Sidebar Render:
```
👤 Sidebar Render - User Info: { roleId: 0, isAdmin: true }
```

## Quick Tests

### Test Projects API:
```javascript
const token = localStorage.getItem('auth_token')
fetch('https://localhost:7188/api/projects?page=1&pageSize=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

### Test Users API:
```javascript
const token = localStorage.getItem('auth_token')
fetch('https://localhost:7188/api/User/GetAllUsers', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

## Status Indicators

### Project Status Colors:
- 🟢 Active - Green
- 🔵 Planned - Blue
- ⚪ Completed - Gray
- 🟡 OnHold - Yellow

### User Status:
- 🟢 Active
- 🔴 Inactive

## Key Files

### Authentication:
- `lib/api/auth.ts` - Auth API client
- `store/authStore.ts` - Auth state management

### Dashboard:
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard
- `app/(dashboard)/dashboard/projects/page.tsx` - Projects
- `app/(dashboard)/dashboard/users/page.tsx` - Users
- `app/(dashboard)/dashboard/admin/approvals/page.tsx` - Approvals

### API Integration:
- `lib/api/projects.ts` - Projects API
- `lib/api/users.ts` - Users API
- `lib/api/tasks.ts` - Tasks API

### Hooks:
- `lib/hooks/useProjects.ts` - Project hooks
- `lib/hooks/useUsers.ts` - User hooks
- `lib/hooks/useTasks.ts` - Task hooks

## Documentation

- `INTEGRATION_COMPLETE_SUMMARY.md` - Complete overview
- `DASHBOARD_INTEGRATION_COMPLETE.md` - Integration details
- `TEST_INTEGRATION.md` - Testing guide
- `ROLE_DISPLAY_FINAL_FIX.md` - Role fix details
- `QUICK_FIX_GUIDE.md` - Quick troubleshooting

---

**Everything is ready! Just start both servers and test!**
