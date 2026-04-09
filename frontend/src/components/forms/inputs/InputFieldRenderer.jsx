import React from 'react'
import { Box } from '@mui/material'
import ControlLabel from './ControlLabel'
import { getPaddingLeftForType } from '@/utils/formHelpers'

import {
  TextInputs,
  NumberInputs,
  Checkbox,
  CheckboxSet,
  Radio,
  Dropdown,
  DateInputs,
  TextareaInputs,
  FileInputs,
  Section,
  Instruction,
  Figure
} from './index'

/**
 * Unified form field renderer
 * Supports four modes: edit, preview, fill, populate
 * All modes display number and label
 *
 * @param {Object} props
 * @param {Object} props.element - Form element object
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Value change callback (parameter is element.name)
 * @param {boolean} props.disabled - Whether disabled
 * @param {string} props.mode - Display mode: 'edit' | 'preview' | 'fill' | 'populate'
 * @param {string} props.travelerId - Traveler ID (for file upload)
 * @param {Object} props.fileUploadRef - Ref for file upload component
 * @returns {JSX.Element}
 */
const InputFieldRenderer = ({ element, value, onChange, disabled, mode = 'preview', travelerId, fileUploadRef }) => {
  const { type } = element
  const paddingLeft = getPaddingLeftForType(type)

  // Special handling for Section, return directly without label layout
  if (type === 'section') {
    return <Section element={element} />
  }

  // Special handling for Instruction, return directly without label layout
  if (type === 'instruction') {
    return <Instruction element={element} />
  }

  // Special handling for Figure
  if (type === 'figure') {
    return <Figure element={element} />
  }

  // Determine disabled state and value handling based on mode
  const isDisabled = mode === 'edit' || mode === 'populate' || disabled
  const displayValue = mode === 'edit' ? '' : (value || '')
  const handleChange = mode === 'populate' ? () => {} : onChange

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: '20px',
      paddingLeft: paddingLeft
    }}>
      {/* All modes display label */}
      <ControlLabel element={element} />

      {/* Input control */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {resolveInputControl(type, element, displayValue, handleChange, isDisabled, mode, travelerId, fileUploadRef)}
      </Box>
    </Box>
  )
}

/**
 * Resolve input control based on type
 */
const resolveInputControl = (type, element, value, onChange, disabled, mode, travelerId, fileUploadRef) => {
  switch (type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return <TextInputs element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'number':
      return <NumberInputs element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'paragraph':
      return <TextareaInputs element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'checkbox':
      return <Checkbox element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'checkbox-set':
      return <CheckboxSet element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'radio':
      return <Radio element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'dropdown':
      return <Dropdown element={element} value={value} onChange={onChange} disabled={disabled} mode={mode} />

    case 'date':
    case 'datetime':
    case 'time':
      return <DateInputs element={element} value={value} onChange={onChange} disabled={disabled} />

    case 'file':
      return <FileInputs element={element} value={value} onChange={onChange} disabled={disabled} travelerId={travelerId} mode={mode} ref={fileUploadRef} />

    default:
      console.warn(`Unknown element type: "${type}", defaulting to 'text'`, element)
      return <TextInputs element={{ ...element, type: 'text' }} value={value} onChange={onChange} disabled={disabled} />
  }
}

export default InputFieldRenderer