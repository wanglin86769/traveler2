import api from './api'

const binderService = {
  getBinders: (params = {}) => {
    return api.get('/binders', { params })
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
export const getBinder = binderService.getBinder
export const createBinder = binderService.createBinder
export const updateBinder = binderService.updateBinder
export const deleteBinder = binderService.deleteBinder
export const addWorkToBinder = binderService.addWork
export const getBinderWorks = binderService.getWorks
export const removeWorkFromBinder = binderService.removeWork
export const updateBinderStatus = binderService.updateStatus
export const addWorksToBinder = binderService.addWorks

export default binderService
