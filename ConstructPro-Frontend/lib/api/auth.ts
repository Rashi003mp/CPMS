import apiClient from './axios'
import type { LoginRequest, RegistrationRequest, User, Role } from '@/types/user'
import type { ApiResponse } from '@/types/api'

// Simple JWT decoder
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT decode error:', error)
    throw new Error('Invalid token')
  }
}

// Extract claim value from JWT (handles .NET claim URIs)
function extractClaim(decoded: any, claimName: string): string | undefined {
  // Try standard claim name first
  if (decoded[claimName]) {
    return decoded[claimName]
  }
  
  // Try ALL possible .NET claim URI formats
  const dotNetClaimUris: Record<string, string[]> = {
    'sub': [
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    ],
    'name': [
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    ],
    'role': [
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
    ],
  }
  
  // Try all possible URIs for this claim
  const possibleUris = dotNetClaimUris[claimName] || []
  for (const uri of possibleUris) {
    if (decoded[uri]) {
      return decoded[uri]
    }
  }
  
  return undefined
}

// Map role string to role ID number
function getRoleId(roleString: string | undefined): number {
  if (!roleString) {
    console.warn('⚠️ No role string provided, defaulting to ProjectManager (1)')
    return 1
  }
  
  const roleMap: Record<string, number> = {
    'Admin': 0,
    'ProjectManager': 1,
    'SiteEngineer': 2,
    'Client': 3,
  }
  
  const roleId = roleMap[roleString]
  
  if (roleId === undefined) {
    console.warn(`⚠️ Unknown role string "${roleString}", defaulting to ProjectManager (1)`)
    return 1
  }
  
  return roleId
}

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/login', data)
    const token = response.data.data!
    
    // Decode JWT
    const decoded = decodeJwt(token)
    
    console.log('🔍 JWT Decoded:', decoded)
    
    // Extract claims
    const userId = extractClaim(decoded, 'sub')
    const userName = extractClaim(decoded, 'name')
    const userRole = extractClaim(decoded, 'role')
    
    console.log('📋 Extracted Claims:', {
      userId,
      userName,
      userRole,
    })
    
    // Get role ID
    const roleId = getRoleId(userRole)
    
    console.log('🎭 Role Mapping:', {
      roleString: userRole,
      roleId: roleId,
      roleIdType: typeof roleId,
      mapping: {
        'Admin': 0,
        'ProjectManager': 1,
        'SiteEngineer': 2,
        'Client': 3,
      }
    })
    
    // Validate roleId is a number
    if (typeof roleId !== 'number' || roleId < 0 || roleId > 3) {
      console.error('❌ Invalid roleId:', roleId)
      throw new Error('Invalid role ID received from token')
    }
    
    // Create user object
    const user: User = {
      id: parseInt(userId || '0'),
      name: userName || 'Unknown',
      email: data.email,
      phone: '',
      roleId: roleId as Role,
      isActive: true,
    }
    
    console.log('✅ Final User Object:', JSON.stringify(user, null, 2))
    console.log('✅ User will see role:', ['Admin', 'Project Manager', 'Site Engineer', 'Client'][roleId] || 'Unknown')
    console.log('✅ Is Admin?', roleId === 0)
    
    return { token, user }
  },

  // Register
  register: async (data: RegistrationRequest): Promise<void> => {
    await apiClient.post<ApiResponse>('/registration', data)
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse>('/auth/forgot-password', { email })
  },

  // Reset Password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse>('/auth/reset-password', {
      token,
      newPassword,
    })
  },
}
