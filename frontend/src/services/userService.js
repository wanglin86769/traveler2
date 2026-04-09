import api from './api'

const userService = {
  getUsers: (params = {}) => {
    return api.get('/users', { params })
  },

  getUser: (id) => {
    return api.get(`/users/${id}`)
  },

  createUser: (data) => {
    return api.post('/users', data)
  },

  updateUser: (id, data) => {
    return api.put(`/users/${id}`, data)
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`)
  }
}

// Named exports
export const getUsers = userService.getUsers
export const getUser = userService.getUser
export const createUser = userService.createUser
export const updateUser = userService.updateUser
export const deleteUser = userService.deleteUser

export default userService