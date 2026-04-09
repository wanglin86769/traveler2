import React from 'react'
import { Box, Typography } from '@mui/material'
import FileUpload from './FileUpload'

/**
 * File input field component
 * Used in traveler input page, provides complete file upload functionality
 *
 * @param {Object} props
 * @param {string} props.travelerId - Traveler ID
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value (TravelerData object)
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
function FileInputField({ travelerId, element, value, onChange, disabled }) {
  const { name, label, required, helpText, accept, filetype } = element

  return (
    <Box sx={{ mb: 2 }}>
      {/* Label */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      </Box>

      {/* File upload component */}
      <FileUpload
        travelerId={travelerId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        filetype={filetype}
      />

      {/* Help text */}
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default FileInputField