import api from './api'

const adminService = {
  getStats: () => {
    return api.get('/admin/stats')
  },

  getUsers: (params = {}) => {
    return api.get('/admin/users', { params })
  },

  createUser: (data) => {
    return api.post('/admin/users', data)
  },

  updateUser: (id, data) => {
    return api.put(`/admin/users/${id}`, data)
  },

  deleteUser: (id) => {
    return api.delete(`/admin/users/${id}`)
  },

  getGroups: (params = {}) => {
    return api.get('/admin/groups', { params })
  },

  createGroup: (data) => {
    return api.post('/admin/groups', data)
  },

  updateGroup: (id, data) => {
    return api.put(`/admin/groups/${id}`, data)
  },

  deleteGroup: (id) => {
    return api.delete(`/admin/groups/${id}`)
  }
}

export default adminService