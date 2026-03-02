import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import toast from 'react-hot-toast'
import type { LoginRequest, RegistrationRequest } from '@/types/user'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      toast.success('Login successful!')
      router.push('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegistrationRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration submitted! Awaiting admin approval.')
      router.push('/login')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    },
  })

  // Logout
  const logout = () => {
    clearAuth()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}
