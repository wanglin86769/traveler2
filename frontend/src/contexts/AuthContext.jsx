import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import authService from '@/services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isInitializingRef = useRef(false)

  // Initialize: read token from localStorage
  useEffect(() => {
    // Prevent duplicate initialization due to React Strict Mode
    if (isInitializingRef.current) {
      return
    }
    
    isInitializingRef.current = true
    const storedToken = localStorage.getItem('token')
    
    if (storedToken) {
      setToken(storedToken)
      // Validate token and get user info from /me endpoint
      // getCurrentUser will set isAuthenticated based on the result
      getCurrentUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Get current user info from /me endpoint
  const getCurrentUser = async (authToken) => {
    try {
      const response = await authService.getMe()
      setUser(response)
      setIsAuthenticated(true)
    } catch (err) {
      console.error('Failed to get current user:', err)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async (username, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authService.login(username, password)
      const { token } = response

      setToken(token)
      localStorage.setItem('token', token)

      // Fetch complete user info from /me endpoint
      // getCurrentUser will set isAuthenticated based on the result
      await getCurrentUser(token)

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      setIsAuthenticated(false)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      setError(null)
    }
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await authService.refresh()
      const { token } = response
      setToken(token)
      localStorage.setItem('token', token)
      return { success: true }
    } catch (err) {
      logout()
      return { success: false }
    }
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext