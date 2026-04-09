import React from 'react'
import { Box, Typography, MenuItem, Select, FormControl, Tooltip, IconButton } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { selectStyles, helpTextStyles } from '../styles'
import { hasOptions, renderOptionsTooltip, getSelectedOptionLabel } from '@/utils/formHelpers'

/**
 * Dropdown component for select input
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback
 * @param {boolean} props.disabled - Whether disabled
 * @param {string} props.mode - Display mode
 * @returns {JSX.Element}
 */
const Dropdown = ({ element, value, onChange, disabled, mode }) => {
  const { name, type, label, required, helpText, options } = element

  // In edit mode, show disabled select with proper appearance
  const isDisabled = disabled || mode === 'edit'
  const displayValue = mode === 'edit' ? '' : (value || '')

  // Normal dropdown select (for all modes)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl fullWidth={false} size="small" disabled={isDisabled} required={required} sx={selectStyles}>
          <Select
            value={displayValue}
            onChange={(e) => onChange(name, e.target.value)}
            displayEmpty
            sx={selectStyles}
            MenuProps={{
              disableScrollLock: true
            }}
          >
            <MenuItem value="">
              <em>Select...</em>
            </MenuItem>
            {(options || []).map((opt, idx) => (
              <MenuItem key={idx} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {hasOptions(options) && (
          <Tooltip
            title={
              <Box sx={{ whiteSpace: 'pre-line', fontSize: '12px', lineHeight: 1.6 }}>
                {renderOptionsTooltip(options, displayValue)}
              </Box>
            }
            arrow
            placement="right"
            enterDelay={300}
            leaveDelay={100}
          >
            <IconButton 
              size="small" 
              sx={{ 
                color: 'text.secondary',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={helpTextStyles}>
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default Dropdown