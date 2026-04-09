import React from 'react'
import { TextField, Box, Typography } from '@mui/material'
import { textareaStyles, helpTextStyles } from '../styles'

/**
 * Text area input control (paragraph)
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const TextareaInputs = ({ element, value, onChange, disabled }) => {
  const { name, placeholder, required, helpText, rows } = element

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TextField
        fullWidth={false}
        multiline
        rows={rows || 3}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        required={required}
        size="small"
        sx={textareaStyles}
      />
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default TextareaInputs