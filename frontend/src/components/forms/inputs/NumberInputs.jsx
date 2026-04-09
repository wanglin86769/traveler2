import React, { useState } from 'react'
import { TextField, Box, Typography } from '@mui/material'
import { numberFieldStyles, helpTextStyles } from '../styles'

/**
 * Number input control (number)
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const NumberInputs = ({ element, value, onChange, disabled }) => {
  const { name, type, placeholder, required, helpText, min, max, step, unit } = element

  // State management for validation
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(true)

  const hasMin = min != null && min !== ''
  const hasMax = max != null && max !== ''

  // Validation function
  const validateValue = (val) => {
    // Empty value validation
    if (!val) {
      return { valid: true, error: '' }
    }
    
    // Number validation
    const numValue = parseFloat(val)
    if (isNaN(numValue)) {
      return { valid: false, error: 'Please enter a valid number' }
    }
    
    // Min validation - only validate if min exists and is not empty
    if (hasMin && numValue < min) {
      return { valid: false, error: `Value must be greater than or equal to ${min}` }
    }
    
    // Max validation - only validate if max exists and is not empty
    if (hasMax && numValue > max) {
      return { valid: false, error: `Value must be less than or equal to ${max}` }
    }
    
    return { valid: true, error: '' }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
        <TextField
          type="number"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => {
            onChange(name, e.target.value)
            const validation = validateValue(e.target.value)
            setIsValid(validation.valid)
            setError(validation.error)
          }}
          disabled={disabled}
          required={required}
          size="small"
          error={!isValid && value !== ''}
          slotProps={{
            input: {
              min: min || undefined,
              max: max || undefined,
              step: 'any'
            }
          }}
          sx={numberFieldStyles}
        />
        {(hasMin || hasMax) && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
            {hasMin && `min: ${min}`}
            {hasMin && hasMax && ', '}
            {hasMax && `max: ${max}`}
          </Typography>
        )}
      </Box>
      {!isValid && value !== '' && (
        <Typography variant="caption" color="error" sx={{ fontSize: '12px' }}>
          {error}
        </Typography>
      )}
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default NumberInputs