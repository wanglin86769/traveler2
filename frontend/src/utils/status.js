// ============ Form Status ============
export const FORM_STATUS = {
  DRAFT: 0,
  SUBMITTED: 0.5,
  RELEASED: 1,
  ARCHIVED: 2
}

export const getFormStatusInfo = (status) => {
  const statusMap = {
    [FORM_STATUS.DRAFT]: {
      label: 'Draft',
      color: 'default'
    },
    [FORM_STATUS.SUBMITTED]: {
      label: 'Submitted for Review',
      color: 'warning'
    },
    [FORM_STATUS.RELEASED]: {
      label: 'Released',
      color: 'success'
    },
    [FORM_STATUS.ARCHIVED]: {
      label: 'Archived',
      color: 'error'
    }
  }
  return statusMap[status] || { label: 'Unknown', color: 'default' }
}

export const getFormStatusLabel = (status) => getFormStatusInfo(status).label
export const getFormStatusColor = (status) => getFormStatusInfo(status).color

// ============ Traveler Status ============
export const TRAVELER_STATUS = {
  INITIALIZED: 0,
  ACTIVE: 1,
  SUBMITTED: 1.5,
  COMPLETED: 2,
  FAILED: 3,
  ARCHIVED: 4
}

export const getTravelerStatusInfo = (status) => {
  const statusMap = {
    [TRAVELER_STATUS.INITIALIZED]: {
      label: 'Initialized',
      color: 'default'
    },
    [TRAVELER_STATUS.ACTIVE]: {
      label: 'Active',
      color: 'primary'
    },
    [TRAVELER_STATUS.SUBMITTED]: {
      label: 'Submitted',
      color: 'warning'
    },
    [TRAVELER_STATUS.COMPLETED]: {
      label: 'Completed',
      color: 'success'
    },
    [TRAVELER_STATUS.FAILED]: {
      label: 'Failed',
      color: 'error'
    },
    [TRAVELER_STATUS.ARCHIVED]: {
      label: 'Archived',
      color: 'default'
    }
  }
  return statusMap[status] || { label: 'Unknown', color: 'default' }
}

export const getTravelerStatusLabel = (status) => getTravelerStatusInfo(status).label
export const getTravelerStatusColor = (status) => getTravelerStatusInfo(status).color

// ============ Binder Status ============
export const BINDER_STATUS = {
  NEW: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  ARCHIVED: 3
}

export const getBinderStatusInfo = (status) => {
  const statusMap = {
    [BINDER_STATUS.NEW]: {
      label: 'New',
      color: 'default'
    },
    [BINDER_STATUS.ACTIVE]: {
      label: 'Active',
      color: 'primary'
    },
    [BINDER_STATUS.COMPLETED]: {
      label: 'Completed',
      color: 'success'
    },
    [BINDER_STATUS.ARCHIVED]: {
      label: 'Archived',
      color: 'default'
    }
  }
  return statusMap[status] || { label: 'Unknown', color: 'default' }
}

export const getBinderStatusLabel = (status) => getBinderStatusInfo(status).label
export const getBinderStatusColor = (status) => getBinderStatusInfo(status).color