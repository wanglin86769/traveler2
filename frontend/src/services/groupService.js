import api from './api'

const groupService = {
  getGroups: (params = {}) => {
    return api.get('/groups', { params })
  },

  getGroup: (id) => {
    return api.get(`/groups/${id}`)
  },

  createGroup: (data) => {
    return api.post('/groups', data)
  },

  updateGroup: (id, data) => {
    return api.put(`/groups/${id}`, data)
  },

  deleteGroup: (id) => {
    return api.delete(`/groups/${id}`)
  },

  addMember: (id, userId) => {
    return api.post(`/groups/${id}/members`, { userId })
  },

  removeMember: (id, userId) => {
    return api.delete(`/groups/${id}/members/${userId}`)
  }
}

export default groupService
