import api from './api'

const binderService = {
  getBinders: (params = {}) => {
    return api.get('/binders', { params })
  },

  getMyBinders: (params = {}) => {
    return api.get('/binders/my', { params })
  },

  getTransferredBinders: (params = {}) => {
    return api.get('/binders/transferred', { params })
  },

  getSharedBinders: (params = {}) => {
    return api.get('/binders/shared', { params })
  },

  getGroupSharedBinders: (params = {}) => {
    return api.get('/binders/group-shared', { params })
  },

  getArchivedBinders: (params = {}) => {
    return api.get('/binders/archived', { params })
  },

  getPublicBinders: (params = {}) => {
    return api.get('/binders/public', { params })
  },

  getWritableBinders: (params = {}) => {
    return api.get('/binders/writable', { params })
  },

  getBinder: (id) => {
    return api.get(`/binders/${id}`)
  },

  createBinder: (data) => {
    return api.post('/binders', data)
  },

  updateBinder: (id, data) => {
    return api.put(`/binders/${id}`, data)
  },

  deleteBinder: (id) => {
    return api.delete(`/binders/${id}`)
  },

  archiveBinder: (id) => {
    return api.put(`/binders/${id}/archive`)
  },

  dearchiveBinder: (id) => {
    return api.put(`/binders/${id}/dearchive`)
  },

  transferOwnership: (binderIds, userId) => {
    return api.put('/binders/transfer', { binderIds, userId })
  },

  addWork: (id, work) => {
    return api.post(`/binders/${id}/works`, work)
  },

  getWorks: (id) => {
    return api.get(`/binders/${id}/works`)
  },

  removeWork: (id, workId) => {
    return api.delete(`/binders/${id}/works/${workId}`)
  },

  updateStatus: (id, status) => {
    return api.put(`/binders/${id}/status`, { status })
  },

  addWorks: (id, data) => {
    return api.post(`/binders/${id}`, data)
  }
}

// Named exports for individual functions
export const getBinders = binderService.getBinders
export const getMyBinders = binderService.getMyBinders
export const getTransferredBinders = binderService.getTransferredBinders
export const getSharedBinders = binderService.getSharedBinders
export const getGroupSharedBinders = binderService.getGroupSharedBinders
export const getArchivedBinders = binderService.getArchivedBinders
export const getPublicBinders = binderService.getPublicBinders
export const getWritableBinders = binderService.getWritableBinders
export const getBinder = binderService.getBinder
export const createBinder = binderService.createBinder
export const updateBinder = binderService.updateBinder
export const deleteBinder = binderService.deleteBinder
export const archiveBinder = binderService.archiveBinder
export const dearchiveBinder = binderService.dearchiveBinder
export const transferOwnership = binderService.transferOwnership
export const addWorkToBinder = binderService.addWork
export const getBinderWorks = binderService.getWorks
export const removeWorkFromBinder = binderService.removeWork
export const updateBinderStatus = binderService.updateStatus
export const addWorksToBinder = binderService.addWorks

export default binderService
