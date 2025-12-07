import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient, { setToken, setRefreshToken, removeTokens, getToken } from '../lib/api-client'
import type { User, LoginCredentials, ApiResponse, LoginResponse } from '../types/index'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getToken()

      if (!token) {
        setLoading(false)
        return
      }

      const response = await apiClient.get<ApiResponse<User>>('/users/me')

      if (response.data.success && response.data.data) {
        setUser(response.data.data)
      } else {
        removeTokens()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      removeTokens()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/login', credentials)

      if (response.data.success && response.data.data) {
        const { tokens } = response.data.data

        setToken(tokens.access_token)
        setRefreshToken(tokens.refresh_token)

        // Fetch user profile
        const userResponse = await apiClient.get<ApiResponse<User>>('/users/me')
        if (userResponse.data.success && userResponse.data.data) {
          setUser(userResponse.data.data)
        }

        toast.success('Login successful!')
        navigate('/')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    removeTokens()
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
