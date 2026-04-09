import React from 'react'
import { Box, Typography } from '@mui/material'
import { numberBadgeStyles, requiredMarkStyles, getTypeColor } from '../styles'

/**
 * Render control label and number
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @returns {JSX.Element}
 */
const ControlLabel = ({ element }) => {
  const { number, label, required, type } = element

  // Section and Instruction have special number display, handled elsewhere
  if (type === 'section' || type === 'instruction') {
    return null
  }

  const color = getTypeColor(type)

  return (
    <Box className="control-label" sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      width: '200px',
      minWidth: '200px',
      maxWidth: '200px',
      flexShrink: 0
    }}>
      <span className="control-number" style={numberBadgeStyles(color)}>
        {number || ''}
      </span>
      <Typography className="model-label" variant="body2" sx={{ fontWeight: 400, fontSize: '14px' }}>
        {label}
        {required && <span style={requiredMarkStyles}> *</span>}
      </Typography>
    </Box>
  )
}

export default ControlLabel