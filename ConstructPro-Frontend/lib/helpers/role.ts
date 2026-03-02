import { Role } from '@/types/user'
import type { User } from '@/types/user'

export function isAdmin(user: User | null): boolean {
  return user?.roleId === Role.Admin
}

export function isProjectManager(user: User | null): boolean {
  return user?.roleId === Role.ProjectManager
}

export function isSiteEngineer(user: User | null): boolean {
  return user?.roleId === Role.SiteEngineer
}

export function isClient(user: User | null): boolean {
  return user?.roleId === Role.Client
}

export function canManageProjects(user: User | null): boolean {
  return isAdmin(user) || isProjectManager(user)
}

export function canManageTasks(user: User | null): boolean {
  return isAdmin(user) || isProjectManager(user) || isSiteEngineer(user)
}

export function canApproveUsers(user: User | null): boolean {
  return isAdmin(user) || isProjectManager(user)
}
