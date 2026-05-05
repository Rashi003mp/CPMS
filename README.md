# ConstructPro CPMS

ConstructPro CPMS is a construction project management system with a .NET 8 Web API and a Next.js dashboard. It supports role-based access, project and task workflows, user assignment, comments, image uploads, and real-time activity updates through SignalR.

## Tech Stack

- Backend: ASP.NET Core 8, Entity Framework Core, Dapper, SQL Server, JWT authentication, SignalR, Swagger
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand, Axios, Radix UI
- Storage and integrations: SQL Server for application data, Cloudinary for uploaded project images

## Repository Layout

```text
ConstrictionPM.API/             ASP.NET Core API, controllers, middleware, hubs
ConstructionPM.Application/     Services, DTOs, interfaces, application rules
ConstructionPM.Domain/          Entities and enums
ConstructionPM.Infrastructure/  EF Core, Dapper repositories, external services
ConstructPro-Frontend/          Next.js dashboard application
ConstructionPMS.sln             .NET solution
```

## Features

- Authentication with JWT tokens
- Admin approval flow for user registrations
- Role-aware dashboard for admins, project managers, site engineers, and clients
- Project create, edit, delete, assignment, image upload, and status tracking
- Task create, edit, status updates, comments, and assignment workflows
- Real-time project and task activity feed with SignalR
- Swagger API documentation in development

## Prerequisites

- .NET SDK 8
- Node.js 18 or newer
- SQL Server or SQL Server Express
- Cloudinary account credentials if image upload is enabled

## Configuration

Backend settings live in `ConstrictionPM.API/appsettings.json` and `ConstrictionPM.API/appsettings.Development.json`.

Set the following values for local development:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ConstructionPM;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "Secret": "replace-with-a-long-local-secret",
    "Issuer": "ConstructPro",
    "Audience": "ConstructPro"
  },
  "CloudinarySettings": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}
```

Frontend environment variables live in `ConstructPro-Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://localhost:7188/api
NEXT_PUBLIC_APP_NAME=ConstructPro
```

Keep secrets out of commits. Use local environment files, user secrets, or deployment secrets for production values.

## Local Development

Restore and run the API:

```powershell
dotnet restore
dotnet build
dotnet run --project ConstrictionPM.API/ConstructionPM.API.csproj
```

Run the frontend:

```powershell
cd ConstructPro-Frontend
npm install
npm run dev
```

Open the app at `http://localhost:3000`. The API Swagger UI is available from the backend development URL at `/swagger`.

## Database

The backend uses SQL Server through Entity Framework Core and Dapper. Apply migrations or database scripts before starting the app against a fresh database.

Useful commands:

```powershell
dotnet ef database update --project ConstructionPM.Infrastructure --startup-project ConstrictionPM.API
```

If EF tooling is missing:

```powershell
dotnet tool install --global dotnet-ef
```

## Quality Checks

Before pushing changes:

```powershell
dotnet build
cd ConstructPro-Frontend
npm run lint
npm run build
```

Keep changes small, focused, and covered by the closest available checks. Avoid committing generated folders such as `bin`, `obj`, `.next`, and `node_modules`.

## API Overview

Core backend areas:

- `AuthController`: login and authentication
- `RegistrationController` and `AdminRegistrationController`: user onboarding and approval
- `ProjectsController`: project CRUD, status, image, and dashboard data
- `ProjectUsersController`: project membership and assignments
- `TaskController`: task CRUD and workflow actions
- `CommentsController`: task comments
- `UserController`: user data and management
- `ActivityHub`: SignalR activity stream

## Frontend Overview

Core frontend areas:

- `app/(auth)`: login, registration, password flows
- `app/(dashboard)`: dashboard, projects, tasks, users, and project detail pages
- `components/projects`: project forms, cards, modals, and activity UI
- `components/tasks`: task forms, cards, comments, and edit flows
- `lib/api`: typed API clients
- `lib/hooks`: React Query and SignalR hooks
- `types`: shared frontend TypeScript models

## Branching and Pull Requests

- Work from a focused feature branch.
- Keep commits readable and grouped by intent.
- Include backend and frontend validation notes in pull requests when both layers are affected.
- Do not commit temporary explanation files, local credentials, build outputs, or dependency folders.

## Troubleshooting

- Frontend cannot reach API: confirm `NEXT_PUBLIC_API_URL`, backend HTTPS port, and CORS origin.
- Unauthorized API calls: confirm the JWT token is present and the user role matches the endpoint requirement.
- SignalR does not connect: confirm the backend is running and `/hubs/activity` is reachable.
- Image upload fails: confirm Cloudinary settings and API credentials.
- Database errors: confirm connection string, SQL Server availability, and applied migrations.
