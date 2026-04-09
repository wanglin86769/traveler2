import React from 'react'
import { Box, Typography, FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material'
import { checkboxRadioStyles, checkboxRadioLabelStyles, helpTextStyles } from '../styles'
import {
  handleCheckboxSetValueChange,
  isCheckboxOptionChecked
} from '@/utils/formHelpers'

/**
 * CheckboxSet component for multiple checkboxes
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value (array)
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const CheckboxSet = ({ element, value, onChange, disabled }) => {
  const { name, type, label, helpText, options } = element

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {(options || []).map((option, idx) => (
        <FormControlLabel
          key={idx}
          control={
            <MuiCheckbox
              checked={isCheckboxOptionChecked(value, option)}
              onChange={(e) => onChange(name, handleCheckboxSetValueChange(value, option, e.target.checked))}
              disabled={disabled}
              sx={checkboxRadioStyles}
            />
          }
          label={option}
          sx={{ marginTop: idx > 0 ? '4px' : 0, ...checkboxRadioLabelStyles }}
        />
      ))}
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default CheckboxSet