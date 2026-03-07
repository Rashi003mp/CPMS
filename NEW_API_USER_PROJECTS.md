# New API Endpoint: Get Projects by User ID

## Summary
Created a new API endpoint to get all projects assigned to a specific user (client). This solves the security issue where clients could see all projects in the system.

## New Endpoint

### GET /api/Projects/user/{userId}

**Description:** Get all projects assigned to a specific user with pagination, search, and filtering.

**Authorization:** Admin, ProjectManager, Client

**Security:**
- Clients can only access their own projects (userId must match their token)
- Admins can access any user's projects
- Returns 403 Forbidden if a non-admin tries to access another user's projects

**Parameters:**
- `userId` (path, required): The user ID to get projects for
- `page` (query, optional): Page number (default: 1)
- `pageSize` (query, optional): Items per page (default: 10, max: 100)
- `search` (query, optional): Search in project name and description
- `status` (query, optional): Filter by project status (Planned, Active, OnHold, Completed, Deleted)

**Example Requests:**

```bash
# Get projects for current user (client)
GET https://localhost:7188/api/Projects/user/5?page=1&pageSize=10
Authorization: Bearer {token}

# Get projects with search
GET https://localhost:7188/api/Projects/user/5?search=construction&page=1&pageSize=10
Authorization: Bearer {token}

# Get projects with status filter
GET https://localhost:7188/api/Projects/user/5?status=Active&page=1&pageSize=10
Authorization: Bearer {token}

# Admin getting another user's projects
GET https://localhost:7188/api/Projects/user/10?page=1&pageSize=10
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Project Name",
        "description": "Project Description",
        "status": "Active",
        "createdAt": "2024-01-01T00:00:00",
        "createdByUserName": "Admin User",
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "totalCount": 5,
    "page": 1,
    "pageSize": 10
  },
  "message": "Success",
  "statusCode": 200,
  "isSuccess": true
}
```

## Implementation Details

### Files Modified:

1. **IProjectAssignmentQueryRepository.cs** - Added method signature
2. **ProjectAssignmentQueryRepository.cs** - Implemented query to get project IDs by user
3. **IProjectService.cs** - Added service method signature
4. **ProjectService.cs** - Implemented business logic
5. **ProjectsController.cs** - Added new endpoint with authorization

### Database Query:
The implementation queries the `ProjectUsers` table to find all projects assigned to a user, then retrieves the full project details.

## Usage in Frontend

Replace the current `/api/Projects` call with `/api/Projects/user/{userId}` where userId comes from the logged-in user's token.

Example:
```javascript
// Get current user ID from token
const userId = getCurrentUserId(); // from JWT token

// Fetch user's projects
const response = await fetch(
  `https://localhost:7188/api/Projects/user/${userId}?page=1&pageSize=10`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

## Testing

1. Login as a client user
2. Call `/api/Projects/user/{your-user-id}`
3. Verify you only see projects assigned to you
4. Try accessing another user's projects - should get 403 Forbidden
5. Login as admin and verify you can access any user's projects

## Status
✅ Backend implementation complete
✅ API endpoint tested and running
✅ Security checks in place
⏳ Frontend integration pending
