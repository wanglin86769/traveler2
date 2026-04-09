import React from 'react'
import { Box, Typography } from '@mui/material'
import { helpTextStyles } from '../styles'
import FileUpload from '../upload/FileUpload'

/**
 * File upload component (file)
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value (TravelerData object)
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @param {string} props.travelerId - Traveler ID (for file upload)
 * @param {string} props.mode - Upload mode ('traveler' or 'discrepancy')
 * @param {Object} props.ref - Ref for file upload component
 * @returns {JSX.Element}
 */
const FileInputs = React.forwardRef(({ element, value, onChange, disabled, travelerId, mode = 'traveler' }, ref) => {
  const { name, required, helpText, accept, filetype } = element

  // If travelerId exists, use FileUpload component (with full features)
  if (travelerId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FileUpload
          ref={ref}
          travelerId={travelerId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          accept={accept}
          filetype={filetype}
          mode={mode}
        />
        {helpText && (
          <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
            {helpText}
          </Typography>
        )}
      </Box>
    )
  }

  // If no travelerId, use simple file input (for form preview etc.)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="file"
          disabled={disabled}
          required={required}
          accept={accept || filetype || undefined}
          onChange={(e) => onChange(name, e.target.files?.[0])}
          style={{
            padding: '6px 12px',
            border: '1px solid #E0E0E0',
            borderRadius: '4px',
            backgroundColor: '#F5F5F5',
            fontSize: '12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? '#9E9E9E' : '#757575'
          }}
        />
        {!disabled && (
          <Typography variant="caption" color="#9E9E9E" sx={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
            No file selected.
          </Typography>
        )}
      </Box>
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
})

FileInputs.displayName = 'FileInputs'

export default FileInputs