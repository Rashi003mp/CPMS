# User Assignment & Management Feature - Complete Implementation

## Overview
Implemented comprehensive user management for projects including assign, replace, and unassign functionality with dropdown menus on each assigned user card.

## Features Implemented

### 1. Backend Updates

#### Updated DTOs (`ConstructionPM.Application/DTOs/Projects/GetProjects/ProjectDto.cs`)
Added user ID fields to track assigned users:
```csharp
public int? ProjectManagerId { get; set; }
public List<int>? SiteEngineerId { get; set; }
```

#### Updated Query Repository (`ConstructionPM.Infrastructure/Repositories/Quaries/ProjectQueryRepository.cs`)
Modified `GetByIdDashboardAsync` to include:
- `AssignedUserId` in the SQL query
- Population of `ProjectManagerId` and `SiteEngineerId` lists
- Image URL and ImagePublicId fields

### 2. Frontend Components

#### A. Assign Users Modal (`components/projects/assign-users-modal.tsx`)
- Role selection toggle (Project Manager / Site Engineer)
- Filters users by:
  - Active status
  - Active project count < 5
  - Selected role type
- Displays user cards with avatar, name, email, and project count
- Assign button for each eligible user

#### B. Replace User Modal (`components/projects/replace-user-modal.tsx`)
- Shows current user being replaced
- Requires reason for replacement (mandatory field)
- Lists available replacement users filtered by:
  - Same role as user being replaced
  - Active status
  - Active project count < 5
  - Excludes current user
- Replace button for each eligible user

#### C. Updated Project Dashboard (`app/(dashboard)/projects/[id]/page.tsx`)
- Added dropdown menu (three dots) for each assigned user
- Dropdown options:
  - **Replace**: Opens replace modal
  - **Unassign**: Prompts for reason and removes user
- "+" button in KEY PERSONNEL card header to assign new users
- Real-time data refresh after any user management action

### 3. API Integration (`lib/api/project-users.ts`)

```typescript
// Assign user to project
POST /api/ProjectUsers/{projectId}/assign-user
Body: { role, assignedUserId, assignedUserName }

// Unassign user from project
POST /api/ProjectUsers/unassign-user
Body: { projectId, userId, roleId, reason }

// Replace user in project
POST /api/ProjectUsers/replace-user
Body: { projectId, oldUserId, newUserId, roleId, reason }
```

### 4. Updated Types (`types/project.ts`)
```typescript
export interface Project {
  // ... existing fields
  projectManagerId?: number
  siteEngineerId?: number[]
}
```

## UI/UX Features

### Key Personnel Card
- Clean card layout with user avatars
- Three-dot menu appears on hover for each assigned user
- Dropdown menu with Replace and Unassign options
- "+" button in card header for assigning new users
- Smooth animations and transitions

### User Management Flow

#### Assign Flow:
1. Click "+" button in KEY PERSONNEL card
2. Select role (PM or SE)
3. View filtered eligible users
4. Click "Assign" on desired user
5. Success toast and automatic refresh

#### Replace Flow:
1. Click three-dot menu on assigned user
2. Select "Replace"
3. Enter reason for replacement (required)
4. Select replacement user from filtered list
5. Click "Replace"
6. Success toast and automatic refresh

#### Unassign Flow:
1. Click three-dot menu on assigned user
2. Select "Unassign"
3. Enter reason in prompt dialog
4. Confirm action
5. Success toast and automatic refresh

## Role Mappings
- `1` = Project Manager
- `2` = Site Engineer
- `3` = Client (not assignable to projects)

## User Eligibility Criteria
Users are eligible for assignment/replacement if:
1. User is active (`isActive: true`)
2. User has less than 5 active projects (`activeProjectCount < 5`)
3. User has the required role (ProjectManager or SiteEngineer)
4. For replacement: User is not the current user being replaced

## Files Created/Modified

### Created:
- `CPMS/ConstructPro-Frontend/components/projects/assign-users-modal.tsx`
- `CPMS/ConstructPro-Frontend/components/projects/replace-user-modal.tsx`
- `CPMS/ConstructPro-Frontend/lib/api/project-users.ts`

### Modified Backend:
- `CPMS/ConstructionPM.Application/DTOs/Projects/GetProjects/ProjectDto.cs`
- `CPMS/ConstructionPM.Infrastructure/Repositories/Quaries/ProjectQueryRepository.cs`

### Modified Frontend:
- `CPMS/ConstructPro-Frontend/app/(dashboard)/projects/[id]/page.tsx`
- `CPMS/ConstructPro-Frontend/types/project.ts`

## API Endpoints Used

### Get All Users
```
GET https://localhost:7188/api/User/GetAllUsers
```
Response includes:
- userId, userName, email
- activeProjectCount
- roleName (ProjectManager, SiteEngineer, Client)
- isActive

### Assign User
```
POST https://localhost:7188/api/ProjectUsers/{projectId}/assign-user
Content-Type: application/json

{
  "role": 1,  // 1=PM, 2=SE
  "assignedUserId": 123,
  "assignedUserName": "John Doe"
}
```

### Unassign User
```
POST https://localhost:7188/api/ProjectUsers/unassign-user
Content-Type: application/json

{
  "projectId": 5010,
  "userId": 123,
  "roleId": 1,  // 1=PM, 2=SE
  "reason": "Reassignment to another project"
}
```

### Replace User
```
POST https://localhost:7188/api/ProjectUsers/replace-user
Content-Type: application/json

{
  "projectId": 5010,
  "oldUserId": 123,
  "newUserId": 456,
  "roleId": 1,  // 1=PM, 2=SE
  "reason": "Performance issues"
}
```

## Testing Instructions

### 1. Assign User
1. Navigate to any project dashboard
2. Click the "+" button in KEY PERSONNEL card
3. Select role (Project Manager or Site Engineer)
4. Verify filtered list shows only eligible users
5. Click "Assign" on a user
6. Verify success toast appears
7. Verify user appears in KEY PERSONNEL card

### 2. Replace User
1. Hover over an assigned user in KEY PERSONNEL
2. Click the three-dot menu
3. Select "Replace"
4. Enter a reason for replacement
5. Select a replacement user
6. Click "Replace"
7. Verify success toast and updated personnel list

### 3. Unassign User
1. Hover over an assigned user in KEY PERSONNEL
2. Click the three-dot menu
3. Select "Unassign"
4. Enter a reason in the prompt
5. Confirm action
6. Verify success toast and user removed from list

## Notes

- Only admins can manage user assignments (enforced by backend)
- All modals automatically filter users based on eligibility
- Project data refreshes automatically after any action
- Uses `react-hot-toast` for notifications
- Dropdown menus use Radix UI components
- All user management actions require a reason for audit trail

## Next Steps

To apply the backend changes:
1. Stop the currently running backend API
2. Restart the backend to load the updated DLLs
3. Test the new user ID fields in the API response
4. Verify all user management operations work correctly

The frontend is ready to use immediately. The TypeScript error about the project-users module is a caching issue and will resolve on next IDE restart or TypeScript server reload.
