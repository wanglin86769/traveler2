import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // If it's a blob response type, return the complete response object
    if (response.config.responseType === 'blob') {
      return response
    }
    // Success response: HTTP status code indicates success (200/201), return data directly
    return response.data
  },
  async (error) => {
    // Failure response: HTTP status code indicates error type (400/403/404/500)
    // error.response.data contains { message: "error message" }
    // Attach error message to error object for easy frontend handling
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.message
    }
    return Promise.reject(error)
  }
)

export default api
