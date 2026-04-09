import { useState, useEffect } from 'react'
import api from '@/services/api'

/**
 * Hook to get FormFile information
 * @param {string} fileId - FormFile ID
 * @returns {Object} { formFile, loading, error }
 */
export function useFormFile(fileId) {
  const [formFile, setFormFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!fileId) {
      setFormFile(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const fetchFormFile = async () => {
      try {
        const response = await api.get(`/formfiles/${fileId}`)
        if (response.success && response.data) {
          setFormFile(response.data)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch file info')
      } finally {
        setLoading(false)
      }
    }

    fetchFormFile()
  }, [fileId])

  return { formFile, loading, error }
}

export default useFormFile