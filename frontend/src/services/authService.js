import api from './api'

const authService = {
  login: (username, password) => {
    return api.post('/auth/login', { username, password })
  },

  logout: () => {
    return api.post('/auth/logout')
  },

  getMe: () => {
    return api.get('/auth/me')
  },

  refresh: () => {
    return api.post('/auth/refresh')
  }
}

export default authService
