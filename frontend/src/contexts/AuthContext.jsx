import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import authService from '@/services/authService'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material'

import {
  Warning as WarningIcon
} from '@mui/icons-material'

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
  const [tokenExpiring, setTokenExpiring] = useState(false)
  const isInitializingRef = useRef(false)
  const expiryCheckTimerRef = useRef(null)

  // Parse JWT token to get expiry time
  const parseTokenExpiry = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const decoded = JSON.parse(jsonPayload)
      
      if (!decoded.exp) {
        console.warn('Token does not contain exp field')
        return null
      }
      
      return decoded.exp * 1000 // Convert to milliseconds
    } catch (error) {
      console.error('Failed to parse token expiry:', error)
      return null
    }
  }

  // Check if token is expiring (less than 1 minute remaining)
  const checkTokenExpiry = (expiryTime) => {
    if (!expiryTime) return

    const now = Date.now()
    const timeRemaining = expiryTime - now

    // Less than 1 minute remaining or already expired
    if (timeRemaining <= 60 * 1000) {
      setTokenExpiring(true)
    }
  }

  // Handle force logout
  const handleForceLogout = () => {
    // Close dialog first
    setTokenExpiring(false)
    // Then perform logout
    logout()
  }

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

  // Token expiry monitoring
  useEffect(() => {
    if (!token) {
      // Clean up timer when no token
      if (expiryCheckTimerRef.current) {
        clearInterval(expiryCheckTimerRef.current)
        expiryCheckTimerRef.current = null
      }
      return
    }

    const expiryTime = parseTokenExpiry(token)
    if (!expiryTime) {
      // Invalid token, logout
      handleForceLogout()
      return
    }

    // Immediately check token expiry (for page refresh detection)
    checkTokenExpiry(expiryTime)

    // Set up periodic check every 30 seconds
    expiryCheckTimerRef.current = setInterval(() => {
      checkTokenExpiry(expiryTime)
    }, 30 * 1000) // 30 seconds = 30000ms

    // Clean up timer on unmount or token change
    return () => {
      if (expiryCheckTimerRef.current) {
        clearInterval(expiryCheckTimerRef.current)
        expiryCheckTimerRef.current = null
      }
    }
  }, [token])

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Token Expiry Dialog */}
      <Dialog 
        open={tokenExpiring}
        disableEscapeKeyDown={true}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Session Expiration Notice
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your login session is about to expire, please logout and login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleForceLogout}
            variant="contained"
            sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#FB8C00' } }}
            startIcon={<WarningIcon />}
          >
            LOGOUT NOW
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  )
}

export default AuthContext