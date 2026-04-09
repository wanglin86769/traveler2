import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material'
import api from '@/services/api'
import { formatDate } from '@/utils/dateUtils'
import { useRef, useImperativeHandle, forwardRef } from 'react'

/**
 * Simple file upload component for Discrepancy mode
 * Reference original traveler style: Browse button + filename
 */
function DiscrepancyFileUpload({ name, value, onChange, disabled, accept, filetype }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

  // Update selectedFile state when value prop changes
  useEffect(() => {
    if (value instanceof File) {
      setSelectedFile(value)
    } else {
      setSelectedFile(null)
    }
  }, [value, name])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = accept || filetype
    if (allowedTypes) {
      const typeArray = allowedTypes.split(',').map(t => t.trim())
      const fileExt = '.' + file.name.split('.').pop().toLowerCase()
      const typeMatch = typeArray.some(type => {
        if (type.startsWith('.')) {
          return fileExt === type.toLowerCase()
        }
        return file.type.includes(type)
      })

      if (!typeMatch) {
        setError(`Only the following file types are allowed: ${allowedTypes}`)
        return
      }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB')
      return
    }

    // Clear error message
    setError('')
    setSelectedFile(file)

    // Return File object to parent component
    onChange(name, file)
  }

  // Get display filename
  const getFileName = () => {
    if (selectedFile) {
      return selectedFile.name
    }
    if (value instanceof File) {
      return value.name
    }
    if (value?.value) {
      return value.value
    }
    if (value?.file?.originalname) {
      return value.file.originalname
    }
    return ''
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* Browse button and filename */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          component="label"
          size="small"
          sx={{
            backgroundColor: '#F5F5F5',
            color: '#757575',
            borderColor: '#E0E0E0',
            borderRadius: '4px',
            textTransform: 'none',
            padding: '4px 8px',
            fontSize: '12px',
            '&:hover': {
              backgroundColor: '#E0E0E0',
              borderColor: '#BDBDBD'
            }
          }}
          disabled={disabled}
        >
          Browse...
          <input
            type="file"
            accept={accept || filetype || undefined}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </Button>

        <Typography variant="body2" sx={{ color: '#333', fontSize: '14px' }}>
          {getFileName()}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * File upload component for Traveler mode
 * Supports Upload/Cancel button mode, reference original traveler
 */
const TravelerFileUpload = forwardRef(({ travelerId, name, value, onChange, disabled, accept, filetype }, ref) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleUpload: async () => {
      if (!selectedFile) {
        return { success: false }
      }

      setUploading(true)
      setError('')

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', name)
      formData.append('inputType', 'file')

      try {
        const response = await api.post(`/travelers/${travelerId}/data`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        })

        // Backend returns data object directly, no success field
        // Check if response contains valid data to determine if upload succeeded
        if (response && (response._id || response.file || response.name)) {
          // Upload succeeded, clear selected file
          setSelectedFile(null)
          // Trigger data refresh
          onChange(name, response)
          return { success: true }
        } else {
          return { success: false, error: 'Upload failed - Invalid response' }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Upload failed')
        return { success: false, error: err.response?.data?.message || err.message }
      } finally {
        setUploading(false)
      }
    },
    handleCancel: () => {
      setSelectedFile(null)
      setError('')
    },
    hasSelectedFile: () => {
      return !!selectedFile
    }
  }))

  // Update selectedFile state when value prop changes
  useEffect(() => {
    if (value instanceof File) {
      setSelectedFile(value)
    } else {
      setSelectedFile(null)
    }
  }, [value, name])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = accept || filetype
    if (allowedTypes) {
      const typeArray = allowedTypes.split(',').map(t => t.trim())
      const fileExt = '.' + file.name.split('.').pop().toLowerCase()
      const typeMatch = typeArray.some(type => {
        if (type.startsWith('.')) {
          return fileExt === type.toLowerCase()
        }
        return file.type.includes(type)
      })

      if (!typeMatch) {
        setError(`Only the following file types are allowed: ${allowedTypes}`)
        return
      }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB')
      return
    }

    // Clear error message
    setError('')
    setSelectedFile(file)
    // Notify parent component that file is selected
    onChange(name, file)
  }

  // Check if it's an image type
  const isImage = value?.file?.mimetype?.startsWith('image/')
  // Check if file data is valid (has valid file size)
  const hasValidFile = value?.file?.size && value.file.size > 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Error message */}
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {/* Browse button and file info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          component="label"
          size="small"
          sx={{
            backgroundColor: '#F5F5F5',
            color: '#757575',
            borderColor: '#E0E0E0',
            borderRadius: '4px',
            textTransform: 'none',
            padding: '4px 8px',
            fontSize: '12px',
            '&:hover': {
              backgroundColor: '#E0E0E0',
              borderColor: '#BDBDBD'
            }
          }}
          disabled={disabled || uploading}
        >
          Browse...
          <input
            type="file"
            accept={accept || filetype || undefined}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
        </Button>

        {/* Display selected file or uploaded file info */}
        {selectedFile && (
          <>
            <Typography variant="body2" sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#757575', fontSize: '12px' }}>
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </Typography>
          </>
        )}

        {hasValidFile && value && !selectedFile && (
          <>
            <Typography variant="body2" sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
              {value.file?.originalname || 'Unknown file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#757575', fontSize: '12px' }}>
              ({(value.file?.size / 1024).toFixed(2)} KB)
            </Typography>
          </>
        )}

        {!selectedFile && !hasValidFile && (
          <Typography variant="body2" sx={{ color: '#999', fontSize: '12px' }}>
            No file selected.
          </Typography>
        )}
      </Box>

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  )
})

TravelerFileUpload.displayName = 'TravelerFileUpload'

/**
 * File upload component
 * Displays different UI and behavior based on mode
 *
 * @param {Object} props
 * @param {string} props.travelerId - Traveler ID
 * @param {string} props.name - Field name
 * @param {Object} props.value - Current value (TravelerData object or File object)
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @param {string} props.accept - Accepted file types
 * @param {string} props.filetype - File type restriction
 * @param {string} props.mode - Upload mode: 'traveler' or 'discrepancy'
 */
const FileUpload = forwardRef(({ travelerId, name, value, onChange, disabled, accept, filetype, mode = 'traveler' }, ref) => {
  // Return different component based on mode
  if (mode === 'discrepancy') {
    return (
      <DiscrepancyFileUpload
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        filetype={filetype}
      />
    )
  }

  return (
    <TravelerFileUpload
      ref={ref}
      travelerId={travelerId}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      accept={accept}
      filetype={filetype}
    />
  )
})

FileUpload.displayName = 'FileUpload'

export default FileUpload