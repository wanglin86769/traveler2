import React from 'react'
import { Box, Typography, FormControlLabel, Radio as MuiRadio, RadioGroup } from '@mui/material'
import { checkboxRadioStyles, checkboxRadioLabelStyles, helpTextStyles } from '../styles'


/**
 * Radio component for radio button group
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @returns {JSX.Element}
 */
const Radio = ({ element, value, onChange, disabled }) => {
  const { name, type, label, helpText, options } = element

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <RadioGroup
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        {(options || []).map((option, idx) => (
          <FormControlLabel
            key={idx}
            value={option}
            control={<MuiRadio disabled={disabled} sx={checkboxRadioStyles} />}
            label={option}
            sx={{ marginTop: idx > 0 ? '4px' : 0, ...checkboxRadioLabelStyles }}
          />
        ))}
      </RadioGroup>
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default Radio