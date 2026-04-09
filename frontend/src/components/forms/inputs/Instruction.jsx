import React from 'react'
import { Box } from '@mui/material'
import { instructionContainerStyles, instructionNumberStyles, richEditorWrapperStyles } from '../styles'

/**
 * Instruction component for displaying rich text instructions in forms
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @returns {JSX.Element}
 */
const Instruction = ({ element }) => {
  const { number, content } = element

  return (
    <Box
      className="rich-instruction"
      sx={instructionContainerStyles}
    >
      <span className="rich-instruction-number" style={instructionNumberStyles}>
        {number || ''}
      </span>
      <div
        key={content || 'default'}
        className="rich-editor-wrapper"
        style={richEditorWrapperStyles}
        dangerouslySetInnerHTML={{
          __html: content || '<p>Instruction content...</p>'
        }}
      />
    </Box>
  )
}

export default Instruction