export enum Role {
  Admin = 0,
  ProjectManager = 1,
  SiteEngineer = 2,
  Client = 3,
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  roleId: Role
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegistrationRequest {
  name: string
  email: string
  phoneNumber: string
  roleName: Role
  experienceYears?: number
  skills?: string
  projectName?: string
}
