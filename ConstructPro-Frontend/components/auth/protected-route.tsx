"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, token, initializeAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from storage
    initializeAuth()
    
    // Check if user is authenticated
    const checkAuth = () => {
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token')
      const hasUser = user !== null
      
      if (!hasToken || !hasUser || !isAuthenticated) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }

    // Small delay to ensure storage is loaded
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, token, router, initializeAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
