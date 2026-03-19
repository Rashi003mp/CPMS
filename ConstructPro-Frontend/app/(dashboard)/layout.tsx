"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuthStore } from "@/store/authStore"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { ROLE_LABELS } from "@/lib/constants"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  // Check user role
  const isAdmin = user?.roleId === 0
  const isClient = user?.roleId === 3
  
  // Base navigation for all users
  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  ]
  
  // Additional navigation for non-client users
  const extendedNavigation = !isClient ? [
    { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Users", href: "/dashboard/users", icon: Users },
  ] : []
  
  // Admin-only navigation
  const adminNavigation = isAdmin ? [
    { name: "Approvals", href: "/dashboard/admin/approvals", icon: CheckSquare },
  ] : []

  const allNavigation = [...baseNavigation, ...extendedNavigation, ...adminNavigation]

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 shadow-sm transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-50">
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${sidebarCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
              <span className="text-xl font-bold whitespace-nowrap text-gray-900 tracking-tight">ConstructPro</span>
            </div>
            {sidebarCollapsed && (
              <div className="hidden lg:flex w-full justify-center">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                   isActive 
                     ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span className={`transition-all duration-300 ${sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                  {item.name}
                </span>
                {sidebarCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            )})}
            
            {/* Collapse/Expand Button (Desktop only) - Moved here */}
            <div className="hidden lg:flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`transition-all duration-300 ${sidebarCollapsed ? "h-10 w-10 p-0" : "w-full"}`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </Button>
            </div>
          </nav>

          {/* User info */}
          <div className="p-4">
            <div className={`flex items-center mb-3 transition-all duration-300 ${sidebarCollapsed ? "lg:justify-center" : "space-x-3"}`}>
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.roleId !== undefined && user?.roleId !== null 
                    ? ROLE_LABELS[user.roleId] || `Role ${user.roleId}` 
                    : 'No Role'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className={`w-full transition-all duration-300 ${sidebarCollapsed ? "lg:w-10 lg:h-10 lg:p-0" : ""}`}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-2"}`} />
              <span className={`transition-all duration-300 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                Logout
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
