import React from 'react'
import { Box } from '@mui/material'
import { figureStyles, figureCaptionStyles } from '../styles'

/**
 * Figure component for displaying static images in forms
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @returns {JSX.Element}
 */
const Figure = ({ element }) => {
  const { src, alt, figcaption, width } = element

  // Convert width to number if it's a string
  const numericWidth = width ? Number(width) : null

  // Directly use FormFile URL (like original traveler)
  // The src should be in format: /api/formfiles/:id or /uploads/...

  return (
    <figure style={figureStyles}>
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          style={{
            maxWidth: numericWidth ? `${numericWidth}px` : '100%',
            maxHeight: '600px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      ) : (
        <Box
          sx={{
            padding: '40px 20px',
            color: '#999',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          No image selected
        </Box>
      )}
      {figcaption && (
        <figcaption style={figureCaptionStyles}>
          {figcaption}
        </figcaption>
      )}
    </figure>
  )
}

export default Figure