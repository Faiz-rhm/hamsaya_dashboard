import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import Cookies from 'js-cookie'
import type { ApiResponse } from '../types/index'

const API_URL = import.meta.env.VITE_API_URL || 'http://172.30.11.34:8080/api/v1'

// Token management
const TOKEN_KEY = 'hamsaya_admin_token'
const REFRESH_TOKEN_KEY = 'hamsaya_admin_refresh_token'

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 })
}

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 })
}

export const removeTokens = (): void => {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      const refreshToken = getRefreshToken()

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          if (response.data.success && response.data.data.tokens) {
            const { access_token, refresh_token: newRefreshToken } = response.data.data.tokens
            setToken(access_token)
            setRefreshToken(newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${access_token}`
            originalRequest.headers['X-Retry'] = 'true'
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          removeTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        removeTokens()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>
    return axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || 'An error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
