"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    // Initialize auth state from storage when app loads
    initializeAuth()
  }, [initializeAuth])

  return null
}
