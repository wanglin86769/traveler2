import React from 'react'
import { TextField, Box, Typography } from '@mui/material'
import { textFieldStyles, helpTextStyles } from '../styles'

/**
 * Text input controls (text, email, phone, url)
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const TextInputs = ({ element, value, onChange, disabled }) => {
  const { name, type, placeholder, required, helpText } = element

  const inputType = type === 'phone' ? 'tel' : type

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TextField
        fullWidth={false}
        type={inputType}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        required={required}
        size="small"
        sx={textFieldStyles}
      />
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default TextInputs