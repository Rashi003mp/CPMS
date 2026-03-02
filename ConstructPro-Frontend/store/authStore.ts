import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        // Store token in localStorage for axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
        set({ user, token, isAuthenticated: true })
      },
      
      clearAuth: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      initializeAuth: () => {
        // Initialize auth state from storage on app load
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          const state = get()
          
          console.log('🔄 Initializing Auth State:', {
            hasToken: !!token,
            hasUser: !!state.user,
            user: state.user,
            userRoleId: state.user?.roleId,
            userRoleIdType: typeof state.user?.roleId,
          })
          
          // Validate user object has correct roleId type
          if (state.user && typeof state.user.roleId !== 'number') {
            console.error('❌ Invalid roleId type detected, clearing auth')
            set({ user: null, token: null, isAuthenticated: false })
            localStorage.removeItem('auth_token')
            return
          }
          
          if (token && state.user) {
            set({ isAuthenticated: true })
            console.log('✅ Auth initialized successfully')
          } else {
            set({ user: null, token: null, isAuthenticated: false })
            console.log('⚠️ No valid auth state found')
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
