import React from 'react'
import { Box, Typography } from '@mui/material'
import { sectionStyles, sectionLegendStyles, sectionNumberStyles } from '../styles'

/**
 * Section component for displaying form section headers
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @returns {JSX.Element}
 */
const Section = ({ element }) => {
  const { number, legend } = element

  return (
    <Box sx={sectionStyles}>
      <Typography
        component="legend"
        sx={sectionLegendStyles}
      >
        <span className="section-number" style={sectionNumberStyles}>
          {number || '1'}
        </span>
        <span className="label-text">
          {legend || 'Section legend'}
        </span>
      </Typography>
    </Box>
  )
}

export default Section