import api from './api'

const shareService = {
  getSharing: (type, id) => {
    return api.get(`/${type}s/${id}/share`)
  },

  updatePublicAccess: (type, id, access) => {
    return api.put(`/${type}s/${id}/share/public`, { access })
  },

  addUserToShare: (type, id, data) => {
    return api.post(`/${type}s/${id}/share/users`, data)
  },

  updateUserShareAccess: (type, id, userId, access) => {
    return api.put(`/${type}s/${id}/share/users/${userId}`, { access })
  },

  removeUserFromShare: (type, id, userId) => {
    return api.delete(`/${type}s/${id}/share/users/${userId}`)
  },

  addGroupToShare: (type, id, data) => {
    return api.post(`/${type}s/${id}/share/groups`, data)
  },

  updateGroupShareAccess: (type, id, groupId, access) => {
    return api.put(`/${type}s/${id}/share/groups/${groupId}`, { access })
  },

  removeGroupFromShare: (type, id, groupId) => {
    return api.delete(`/${type}s/${id}/share/groups/${groupId}`)
  }
}

export default shareService