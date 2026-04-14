import React, { useState } from 'react'
import { Box, Button, Typography, Alert } from '@mui/material'
import api from '@/services/api'
import { IMAGE_UPLOAD_CONFIG } from '@/config'

function ImageUploader({ imageInfo, onImageUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG and GIF files are allowed')
      return
    }

    if (file.size > IMAGE_UPLOAD_CONFIG.MAX_SIZE) {
      setError('File size must be less than 5MB')
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file) => {
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', 'image')

    try {
      const formId = window.location.pathname.split('/').find(p => /^[a-f0-9]{24}$/i.test(p))

      if (!formId) {
        throw new Error('Could not determine form ID from URL')
      }

      const response = await api.post(`/forms/${formId}/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response) {
        const { url, filename, originalname, size } = response
        onImageUploaded({ src: url, filename: originalname || filename, originalname, size })
      }
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="body1">Select an image</Typography>
        <Button
          variant="outlined"
          component="label"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose File'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </Button>
        {imageInfo?.filename && (
          <Typography variant="body2" color="text.secondary">
            {imageInfo.filename}
          </Typography>
        )}
      </Box>

      {imageInfo?.src && (
        <Box sx={{ mt: 2 }}>
          <Box
            component="img"
            src={imageInfo.src}
            alt="Uploaded image"
            sx={{
              maxWidth: '100%',
              maxHeight: '400px',
              display: 'block',
              border: '1px solid #ddd'
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default ImageUploader