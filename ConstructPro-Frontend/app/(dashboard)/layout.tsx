"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Users", href: "/dashboard/users", icon: Users },
  ]

  // Check if user is admin (roleId === 0)
  const isAdmin = user?.roleId === 0
  
  // Add admin-only navigation
  const adminNavigation = isAdmin ? [
    { name: "Approvals", href: "/dashboard/admin/approvals", icon: CheckSquare },
  ] : []

  const allNavigation = [...navigation, ...adminNavigation]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6">
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${sidebarCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
              <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-xl font-bold whitespace-nowrap">ConstructPro</span>
            </div>
            {sidebarCollapsed && (
              <div className="hidden lg:block">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`transition-all duration-300 ${sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                  {item.name}
                </span>
                {sidebarCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </span>
                )}
              </Link>
            ))}
            
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
