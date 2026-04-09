import React from 'react'
import { Box, Typography } from '@mui/material'
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer'

/**
 * Form renderer component
 * Renders actual form components based on JSON element array
 * Uses shared InputFieldRenderer component for consistency
 */
const FormRenderer = ({ elements, values = {}, onChange, disabled = false, onSectionRegister, travelerId }) => {
  const handleChange = (elementName, value) => {
    if (onChange) {
      onChange(elementName, value)
    }
  }

  const renderElement = (element, index) => {
    const value = values[element.name] || ''

    // Special handling for Section elements
    if (element.type === 'section') {
      return (
        <Box
          key={element.name}
          id={element.id || element.name}
          ref={(el) => {
            if (el && onSectionRegister) {
              onSectionRegister(element.id || element.name, el)
            }
          }}
          sx={{ scrollMarginTop: 80 }}
        >
          <InputFieldRenderer
            element={element}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            mode="preview"
            travelerId={travelerId}
          />
        </Box>
      )
    }

    return (
      <InputFieldRenderer
        key={element.name}
        element={element}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        mode="preview"
        travelerId={travelerId}
      />
    )
  }

  if (!elements || elements.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>No elements to display</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {elements.map(renderElement)}
    </Box>
  )
}

export default FormRenderer