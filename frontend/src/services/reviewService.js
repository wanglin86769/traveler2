import api from './api'

const reviewService = {
  getReviews: (params = {}) => {
    return api.get('/reviews', { params })
  },

  getReview: (id) => {
    return api.get(`/reviews/${id}`)
  },

  createReview: (data) => {
    return api.post('/reviews', data)
  },

  respondToReview: (id, data) => {
    return api.put(`/reviews/${id}/respond`, data)
  },

  getPendingReviews: () => {
    return api.get('/reviews/pending/me')
  }
}

export default reviewService
