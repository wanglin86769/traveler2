import api from './api'

export const getSystemInfo = async () => {
  return await api.get('/system-info')
}

export default { getSystemInfo }