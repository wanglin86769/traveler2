import React from 'react'
import { Box, Typography, FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material'
import { checkboxRadioStyles, checkboxRadioLabelStyles, helpTextStyles } from '../styles'

/**
 * Checkbox component for single checkbox input
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const Checkbox = ({ element, value, onChange, disabled }) => {
  const { name, type, label, required, helpText } = element

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <FormControlLabel
        control={
          <MuiCheckbox
            checked={value || false}
            onChange={(e) => onChange(name, e.target.checked)}
            disabled={disabled}
            required={required}
            size="medium"
            sx={checkboxRadioStyles}
          />
        }
        label={element.text || label}
        sx={checkboxRadioLabelStyles}
      />
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default Checkbox