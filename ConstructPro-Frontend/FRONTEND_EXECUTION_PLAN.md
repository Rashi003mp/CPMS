# ConstructPro Frontend - Execution Plan

## Project Overview
**ConstructPro** is a Construction Project Management System with a comprehensive backend built on .NET Core. This document outlines the frontend implementation plan using Next.js, React, TailwindCSS, and modern data fetching patterns.

---

## Backend API Analysis

### Core Entities
1. **User** - Name, Email, Phone, Role (ProjectManager, SiteEngineer, Client)
2. **Project** - ProjectName, Description, Status, StartDate, EndDate
3. **TaskItem** - Title, Description, ProjectId, AssignedToUserId, DueDate, Status
4. **Comment** - TaskId, CommentText, CreatedBy
5. **RegistrationRequest** - Pending user registrations awaiting admin approval

### Available API Endpoints

#### Authentication & Authorization
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### User Registration
- `POST /api/registration` - Submit registration request
- `GET /api/admin-registration/requests/pending` - Get pending registrations (Admin)
- `POST /api/admin-registration/requests/{id}/approve` - Approve registration (Admin)

#### User Management
- `GET /api/user/GetAllUsers` - List all users
- `GET /api/user/GetUserById/{id}` - Get user details

#### Project Management
- `POST /api/projects/create` - Create new project
- `GET /api/projects` - List all projects
- Additional project operations (update, delete - to be confirmed)

#### Project User Assignment
- `POST /api/project-users/{projectId}/assign-user` - Assign user to project
- `POST /api/project-users/unassign-user` - Remove user from project

#### Task Management
- `POST /api/task` - Create new task
- `PUT /api/task/update` - Update task details

#### Comments
- `POST /api/comments/tasks/{taskId}/comments` - Add comment to task
- `GET /api/comments/tasks/{taskId}/comments` - Get task comments

### Enums & Status Types
- **Role**: ProjectManager (1), SiteEngineer (2), Client (3)
- **ProjectStatus**: Planned (1), Active (2), OnHold (3), Completed (4), Deleted (5)
- **TaskStatus**: Todo (0), InProgress (1), Blocked (2), Completed (3), Cancelled (4)

---

## Technology Stack

### Core Framework
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript** (for type safety)

### Styling
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library built on Radix UI
- **Lucide React** - Icon library

### Data Fetching & State Management
- **TanStack Query (React Query)** - Server state management (NOT jQuery - modern alternative)
- **Axios** - HTTP client for API calls
- **Zustand** - Lightweight client state management (auth, UI state)

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Additional Libraries
- **date-fns** - Date manipulation
- **recharts** - Charts and data visualization
- **react-hot-toast** - Toast notifications

---

## Project Structure

```
ConstructPro-Frontend/
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── users/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── charts/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── tasks.ts
│   │   │   ├── users.ts
│   │   │   └── comments.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── validations/
│   ├── store/
│   │   └── authStore.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── api.ts
│   └── middleware.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Implementation Phases

### Phase 1: Project Setup & Configuration (Day 1)
**Objective**: Initialize Next.js project with all dependencies

**Tasks**:
1. Initialize Next.js project with TypeScript
2. Install and configure TailwindCSS
3. Setup shadcn/ui components
4. Configure Axios with base URL and interceptors
5. Setup TanStack Query provider
6. Create environment variables (.env.local)
7. Setup folder structure
8. Configure TypeScript paths (@/ alias)

**Deliverables**:
- Working Next.js app with routing
- Configured styling system
- API client setup with interceptors

---

### Phase 2: Authentication System (Day 2-3)
**Objective**: Implement complete auth flow

**Tasks**:
1. Create auth store (Zustand) for token management
2. Build login page with form validation
3. Build registration page with role-specific fields
4. Implement forgot password flow
5. Implement reset password flow
6. Create auth middleware for protected routes
7. Setup axios interceptors for JWT token
8. Create auth context/hooks

**Components**:
- LoginForm
- RegisterForm
- ForgotPasswordForm
- ResetPasswordForm

**API Integration**:
- POST /api/auth/login
- POST /api/registration
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Deliverables**:
- Complete authentication flow
- Protected route middleware
- Token refresh mechanism

---

### Phase 3: Dashboard Layout & Navigation (Day 4)
**Objective**: Create main dashboard structure

**Tasks**:
1. Build dashboard layout with sidebar
2. Create navigation menu (role-based)
3. Build header with user profile dropdown
4. Create breadcrumb navigation
5. Build responsive mobile menu
6. Add loading states and error boundaries

**Components**:
- DashboardLayout
- Sidebar
- Header
- UserMenu
- Breadcrumbs
- MobileNav

**Deliverables**:
- Responsive dashboard layout
- Role-based navigation
- User profile section

---

### Phase 4: User Management (Day 5-6)
**Objective**: Implement user listing and management

**Tasks**:
1. Create users list page with table
2. Build user detail view
3. Implement user search and filters
4. Create admin approval page for pending registrations
5. Build user assignment components

**Components**:
- UsersTable
- UserCard
- UserDetailModal
- PendingRegistrationsTable
- ApprovalModal

**API Integration**:
- GET /api/user/GetAllUsers
- GET /api/user/GetUserById/{id}
- GET /api/admin-registration/requests/pending
- POST /api/admin-registration/requests/{id}/approve

**Deliverables**:
- User management interface
- Admin approval workflow
- User search and filtering

---

### Phase 5: Project Management (Day 7-9)
**Objective**: Complete project CRUD operations

**Tasks**:
1. Create projects list page with cards/table view
2. Build create project form with validation
3. Implement project detail page
4. Build project update form
5. Create project status management
6. Implement project user assignment
7. Add project filtering by status
8. Create project dashboard with statistics

**Components**:
- ProjectsGrid/ProjectsTable
- CreateProjectForm
- ProjectDetailPage
- UpdateProjectForm
- ProjectStatusBadge
- AssignUserToProjectModal
- ProjectStats

**API Integration**:
- GET /api/projects
- POST /api/projects/create
- POST /api/project-users/{projectId}/assign-user
- POST /api/project-users/unassign-user

**Deliverables**:
- Complete project management interface
- Project assignment workflow
- Project statistics dashboard

---

### Phase 6: Task Management (Day 10-12)
**Objective**: Implement task tracking system

**Tasks**:
1. Create tasks list page (table and kanban views)
2. Build create task form
3. Implement task detail modal
4. Build task update form
5. Create task status management (drag-and-drop)
6. Implement task filtering and sorting
7. Add task assignment to users
8. Create task timeline view

**Components**:
- TasksTable
- TaskKanbanBoard
- CreateTaskForm
- TaskDetailModal
- UpdateTaskForm
- TaskStatusBadge
- TaskFilters
- TaskTimeline

**API Integration**:
- POST /api/task
- PUT /api/task/update

**Deliverables**:
- Task management interface
- Kanban board view
- Task filtering and sorting

---

### Phase 7: Comments System (Day 13)
**Objective**: Enable task collaboration through comments

**Tasks**:
1. Create comments section component
2. Build add comment form
3. Implement comment list with user info
4. Add real-time comment updates
5. Create comment notifications

**Components**:
- CommentsSection
- CommentForm
- CommentList
- CommentItem

**API Integration**:
- GET /api/comments/tasks/{taskId}/comments
- POST /api/comments/tasks/{taskId}/comments

**Deliverables**:
- Task commenting system
- Comment notifications

---

### Phase 8: Dashboard & Analytics (Day 14-15)
**Objective**: Create overview dashboard with insights

**Tasks**:
1. Build main dashboard page
2. Create project statistics cards
3. Implement task progress charts
4. Build recent activity feed
5. Create user performance metrics
6. Add project timeline visualization
7. Implement role-specific dashboard views

**Components**:
- DashboardStats
- ProjectProgressChart
- TaskStatusChart
- ActivityFeed
- UserPerformanceCard
- ProjectTimeline

**Deliverables**:
- Comprehensive dashboard
- Data visualizations
- Activity tracking

---

### Phase 9: UI/UX Enhancements (Day 16-17)
**Objective**: Polish user experience

**Tasks**:
1. Implement loading skeletons
2. Add error handling and retry mechanisms
3. Create toast notifications
4. Build confirmation dialogs
5. Add form validation feedback
6. Implement optimistic updates
7. Add keyboard shortcuts
8. Create help tooltips

**Components**:
- LoadingSkeleton
- ErrorBoundary
- ConfirmDialog
- Toast notifications
- HelpTooltip

**Deliverables**:
- Polished UI with smooth interactions
- Comprehensive error handling
- User-friendly feedback

---

### Phase 10: Testing & Optimization (Day 18-20)
**Objective**: Ensure quality and performance

**Tasks**:
1. Write unit tests for utilities
2. Create integration tests for API calls
3. Implement E2E tests for critical flows
4. Optimize bundle size
5. Implement code splitting
6. Add performance monitoring
7. Conduct accessibility audit
8. Browser compatibility testing

**Deliverables**:
- Test coverage report
- Performance optimization
- Production-ready application

---

## Key Features by Role

### Project Manager
- Create and manage projects
- Assign users to projects
- Create and assign tasks
- View all project statistics
- Approve user registrations (if admin)
- Monitor project progress

### Site Engineer
- View assigned projects
- Manage assigned tasks
- Update task status
- Add comments to tasks
- View project details

### Client
- View project progress
- View project details
- Add comments to tasks
- View project timeline

---

## API Integration Strategy

### Axios Configuration
```typescript
// Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api'

// Request interceptor for JWT
axios.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error)
  }
)
```

### React Query Setup
```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://localhost:7001/api
NEXT_PUBLIC_APP_NAME=ConstructPro
```

---

## Design System

### Color Palette
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray shades

### Typography
- Font Family: Inter (from Google Fonts)
- Headings: Bold, various sizes
- Body: Regular, 16px base

### Component Patterns
- Cards for content grouping
- Tables for data lists
- Modals for forms and details
- Badges for status indicators
- Buttons with loading states

---

## Security Considerations

1. **JWT Token Storage**: Store in httpOnly cookies or secure localStorage
2. **CSRF Protection**: Implement CSRF tokens for state-changing operations
3. **Input Validation**: Client-side validation with Zod schemas
4. **XSS Prevention**: Sanitize user inputs
5. **Role-Based Access**: Implement route guards based on user roles
6. **HTTPS Only**: Enforce HTTPS in production

---

## Performance Optimization

1. **Code Splitting**: Dynamic imports for routes
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Load components on demand
4. **Caching**: React Query caching strategy
5. **Bundle Analysis**: Regular bundle size monitoring
6. **SSR/SSG**: Use appropriate rendering strategy per page

---

## Deployment Strategy

### Development
- Local development server
- Hot module replacement
- Development API endpoint

### Staging
- Vercel/Netlify deployment
- Staging API endpoint
- E2E testing environment

### Production
- Optimized build
- CDN distribution
- Production API endpoint
- Monitoring and analytics

---

## Next Steps

1. **Review and Approve Plan**: Stakeholder review
2. **Setup Development Environment**: Install dependencies
3. **Begin Phase 1**: Project initialization
4. **Daily Standups**: Track progress
5. **Weekly Reviews**: Demo completed features

---

## Notes

- **jQuery Replacement**: Modern React Query (TanStack Query) provides superior data fetching, caching, and synchronization compared to jQuery
- **Type Safety**: TypeScript ensures type safety across the application
- **Component Reusability**: shadcn/ui provides accessible, customizable components
- **Scalability**: Modular architecture allows easy feature additions
- **Maintainability**: Clear separation of concerns and consistent patterns

---

## Estimated Timeline

**Total Duration**: 20 working days (4 weeks)

- Week 1: Setup, Auth, Dashboard Layout
- Week 2: User & Project Management
- Week 3: Task Management & Comments
- Week 4: Dashboard, Polish, Testing

---

## Success Criteria

✅ All API endpoints integrated
✅ Role-based access control working
✅ Responsive design on all devices
✅ Fast page load times (<3s)
✅ Comprehensive error handling
✅ Accessible UI (WCAG AA)
✅ Test coverage >70%
✅ Production deployment successful

---

**Document Version**: 1.0
**Last Updated**: February 26, 2026
**Prepared By**: Kiro AI Assistant
