import api from './api'

const formService = {
  getForms: (params = {}) => {
    return api.get('/forms', { params })
  },

  getDraftForms: (params = {}) => {
    return api.get('/forms/draft', { params })
  },

  getTransferredForms: (params = {}) => {
    return api.get('/forms/transferred', { params })
  },

  getUnderReviewForms: (params = {}) => {
    return api.get('/forms/under-review', { params })
  },

  getMyReleasedForms: (params = {}) => {
    return api.get('/forms/closed', { params })
  },

  getArchivedForms: (params = {}) => {
    return api.get('/forms/archived', { params })
  },

  getSharedForms: (params = {}) => {
    return api.get('/forms/shared', { params })
  },

  getGroupSharedForms: (params = {}) => {
    return api.get('/forms/group-shared', { params })
  },

  getReleasedForms: (params = {}) => {
    return api.get('/released-forms', { params })
  },

  getForm: (id) => {
    return api.get(`/forms/${id}`)
  },

  createForm: (data) => {
    return api.post('/forms', data)
  },

  updateForm: (id, data) => {
    return api.put(`/forms/${id}`, data)
  },

  archiveForm: (id) => {
    return api.put(`/forms/${id}/archive`)
  },

  submitForReview: (id, reviewers = []) => {
    return api.put(`/reviews/forms/${id}/submit-review`, { reviewers })
  },

  getReviewInfo: (id) => {
    return api.get(`/reviews/forms/${id}/review`)
  },

  addReviewer: (id, uid, name) => {
    return api.post(`/reviews/forms/${id}/review/requests`, { uid, name })
  },

  removeReviewer: (id, requestId) => {
    return api.delete(`/reviews/forms/${id}/review/requests/${requestId}`)
  },

  submitReviewResult: (id, result, comment, v) => {
    return api.post(`/reviews/forms/${id}/review/results`, { result, comment, v })
  },

  releaseForm: (id, data = {}) => {
    return api.post(`/forms/${id}/release`, data)
  },

  getReleasedDiscrepancyForms: () => {
    return api.get('/released-forms', { params: { formType: 'discrepancy' } })
  },

  updateSharing: (id, data) => {
    return api.put(`/forms/${id}/share`, data)
  },

  // Released forms
  getReleasedForm: (id) => {
    return api.get(`/released-forms/${id}`)
  },

  // Reviews
  getMyReviews: (params = {}) => {
    return api.get('/reviews/forms/my-reviews', { params })
  },

  // Clone form
cloneForm: async (id, title) => {
    return api.post(`/forms/${id}/clone`, { title })
},

// Transfer ownership
  transferOwnership: (formIds, userId) => {
    return api.put('/forms/transfer', { formIds, userId })
  },

}

// Named exports for individual functions
export const getForms = formService.getForms
export const getForm = formService.getForm
export const createForm = formService.createForm
export const updateForm = formService.updateForm
export const cloneForm = formService.cloneForm
export const archiveForm = formService.archiveForm
export const submitForReview = formService.submitForReview
export const getReviewInfo = formService.getReviewInfo
export const addReviewer = formService.addReviewer
export const removeReviewer = formService.removeReviewer
export const submitReviewResult = formService.submitReviewResult
export const getMyReviews = formService.getMyReviews
export const releaseForm = formService.releaseForm
export const getDraftForms = formService.getDraftForms
export const getTransferredForms = formService.getTransferredForms
export const getUnderReviewForms = formService.getUnderReviewForms
export const getMyReleasedForms = formService.getMyReleasedForms
export const getArchivedForms = formService.getArchivedForms
export const getReleasedForms = formService.getReleasedForms
export const getSharedForms = formService.getSharedForms
export const getGroupSharedForms = formService.getGroupSharedForms
export const transferOwnership = formService.transferOwnership

export default formService