import React from 'react'
import { TextField, Box, Typography } from '@mui/material'
import { textFieldStyles, helpTextStyles } from '../styles'

/**
 * Date/time input component (date, datetime, time)
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const DateInputs = ({ element, value, onChange, disabled }) => {
  const { name, type, required, helpText } = element

  const inputType = type === 'datetime' ? 'datetime-local' : type

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TextField
        fullWidth={false}
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        required={required}
        size="small"
        slotProps={{
          inputLabel: {
            shrink: true
          }
        }}
        sx={{
          ...textFieldStyles,
          '& .MuiInputBase-input': {
            padding: '6px 12px',
            fontSize: '14px'
          }
        }}
      />
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default DateInputs