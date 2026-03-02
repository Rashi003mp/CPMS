export enum ProjectStatus {
  Planned = 1,
  Active = 2,
  OnHold = 3,
  Completed = 4,
  Deleted = 5,
}

export interface Project {
  id: number
  name: string
  description?: string
  status: string // Backend returns string like "Active", "Planned"
  createdAt: string
  createdByUserName?: string
  projectManagerName?: string
  projectManagerId?: number
  siteEngineerName?: string[]
  siteEngineerId?: number[]
  imageUrl?: string // NEW: Image URL from Cloudinary
}

export interface PaginatedProjects {
  items: Project[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateProjectRequest {
  projectName: string
  description: string
  startDate: string
  endDate?: string
  status: ProjectStatus
  image?: File // NEW: Optional image file
}

export interface UpdateProjectRequest {
  projectName?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: ProjectStatus
  remarks?: string
  image?: File // NEW: Optional new image file
  removeImage?: boolean // NEW: Flag to remove existing image
}

export interface AssignUserToProjectRequest {
  userId: number
  roleInProject?: string
}
