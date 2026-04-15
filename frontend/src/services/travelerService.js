import api from './api'

const travelerService = {
  // My travelers
  getMyTravelers: (params = {}) => {
    return api.get('/travelers/my', { params })
  },

  // Transferred travelers
  getTransferredTravelers: (params = {}) => {
    return api.get('/travelers/transferred', { params })
  },

  // Shared travelers
  getSharedTravelers: (params = {}) => {
    return api.get('/travelers/shared', { params })
  },

  // Group shared travelers
  getGroupSharedTravelers: (params = {}) => {
    return api.get('/travelers/group-shared', { params })
  },

  // Archived travelers
  getArchivedTravelers: (params = {}) => {
    return api.get('/travelers/archived', { params })
  },

  // Legacy function for backward compatibility
  getTravelers: (params = {}) => {
    return api.get('/travelers', { params })
  },

  getTraveler: (id) => {
    return api.get(`/travelers/${id}`)
      .catch(error => {
        console.error('getTraveler error:', error);
        throw error;
      });
  },

  createTraveler: (data) => {
    return api.post('/travelers', data)
  },

  updateTraveler: (id, data) => {
    return api.put(`/travelers/${id}`, data)
  },

  deleteTraveler: (id) => {
    return api.delete(`/travelers/${id}`)
  },

  updateStatus: (id, status) => {
    return api.put(`/travelers/${id}/status`, { status })
  },

  getTravelerData: (id) => {
    return api.get(`/travelers/${id}/data`)
      .then(response => {
        // Backend returns { data: [...], notes: [...] }
        // API interceptor returns this object directly
        return response || { data: [], notes: [] };
      })
      .catch(error => {
        console.error('getTravelerData error:', error);
        throw error;
      });
  },

  submitTravelerData: (id, name, value, type) => {
    return api.post(`/travelers/${id}/data`, {
      name,
      value,
      inputType: type || 'text'
    })
  },

  submitTravelerNote: (id, name, value) => {
    return api.post(`/travelers/${id}/notes`, { name, value })
  },

  updateTravelerNote: (id, noteId, value) => {
    return api.put(`/travelers/${id}/notes/${noteId}`, { value })
  },

  deleteTravelerNote: (id, noteId) => {
    return api.delete(`/travelers/${id}/notes/${noteId}`)
  },

  updateSharing: (id, data) => {
    return api.put(`/travelers/${id}/share`, data)
  },

  archiveTraveler: (id) => {
    return api.put(`/travelers/${id}/archive`)
  },

  // Upload file for traveler
  uploadFile: (travelerId, formData) => {
    return api.post(`/uploads/traveler/${travelerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Discrepancy logs
  getDiscrepancyLogs: (id) => {
    return api.get(`/travelers/${id}/discrepancy-logs`)
  },

  createDiscrepancyLog: (id) => {
    return api.post(`/travelers/${id}/discrepancy-logs`)
  },

  submitDiscrepancyLog: (id, data) => {
    const formData = new FormData()
    formData.append('records', JSON.stringify(data.records || {}))

    if (data.files) {
      Object.entries(data.files).forEach(([name, file]) => {
        formData.append(name, file)
      })
    }

    return api.post(`/travelers/${id}/discrepancy-logs/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  addDiscrepancyRecords: (id, logId, formData) => {
    // Support FormData direct submission (Option B)
    if (formData instanceof FormData) {
      // Don't set Content-Type, let browser set correct boundary
      // Need to remove default Content-Type header
      return api.post(`/travelers/${id}/discrepancy-logs/submit`, formData, {
        headers: {
          'Content-Type': undefined  // Remove default Content-Type, let browser set automatically
        }
      })
    }
    
    // Old format support (backward compatibility)
    const form = new FormData()
    form.append('records', JSON.stringify(formData.records || {}))

    if (formData.files) {
      Object.entries(formData.files).forEach(([name, file]) => {
        form.append(name, file)
      })
    }

    return api.post(`/travelers/${id}/logs/${logId}/records`, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Named exports for individual functions
export const getTravelers = travelerService.getTravelers
export const getMyTravelers = travelerService.getMyTravelers
export const getTransferredTravelers = travelerService.getTransferredTravelers
export const getSharedTravelers = travelerService.getSharedTravelers
export const getGroupSharedTravelers = travelerService.getGroupSharedTravelers
export const getArchivedTravelers = travelerService.getArchivedTravelers
export const getTraveler = travelerService.getTraveler
export const createTraveler = travelerService.createTraveler
export const updateTraveler = travelerService.updateTraveler
export const deleteTraveler = travelerService.deleteTraveler
export const updateStatus = travelerService.updateStatus
export const getTravelerData = travelerService.getTravelerData
export const submitTravelerData = travelerService.submitTravelerData
export const submitTravelerNote = travelerService.submitTravelerNote
export const updateTravelerNote = travelerService.updateTravelerNote
export const deleteTravelerNote = travelerService.deleteTravelerNote
export const archiveTraveler = travelerService.archiveTraveler
export const getDiscrepancyLogs = travelerService.getDiscrepancyLogs
export const createDiscrepancyLog = travelerService.createDiscrepancyLog
export const addDiscrepancyRecords = travelerService.addDiscrepancyRecords

export default travelerService