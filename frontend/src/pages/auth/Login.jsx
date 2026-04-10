import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login: authLogin, isAuthenticated, loading } = useAuth()
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    if (!loading && isAuthenticated && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      navigate('/home', { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const result = await authLogin(username, password)
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  )
}

export default Login