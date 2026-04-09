import React, { useState, useEffect } from 'react'
import { FORM_ELEMENT_DEFINITIONS, FORM_ELEMENT_TYPES } from './elementDefinitions'
import RichTextEditor from '@/components/common/RichTextEditor'
import ImageUploader from '../upload/ImageUploader'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material'

function ElementEditDialog({ open, element, onSave, onClose }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (element) {
      const initializedData = {
        ...element
      }

      setFormData(initializedData)
      setErrors({})
    }
  }, [element])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSave = () => {
    const newErrors = {}

    // Validate label for elements that have it
    if (formData.label !== undefined && (!formData.label || formData.label.trim() === '')) {
      newErrors.label = 'Label is required'
    }

    // Validate legend for section
    if (formData.legend !== undefined && (!formData.legend || formData.legend.trim() === '')) {
      newErrors.legend = 'Section legend is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && element) {
      onSave(formData)
    }
  }

  if (!element || !formData) return null

  const definition = FORM_ELEMENT_DEFINITIONS.find(d => d.type === element.type)
  const type = element.type || FORM_ELEMENT_TYPES.TEXT

  // Render fields based on element type using switch-case
  const renderFields = () => {
    switch (type) {
      case FORM_ELEMENT_TYPES.CHECKBOX:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              error={!!errors.label}
              helperText={errors.label || 'Keep the label brief and unique'}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Text"
              value={formData?.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )
      
      case FORM_ELEMENT_TYPES.CHECKBOX_SET:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Options
              </Typography>
              {(formData.options || []).map((option, idx) => (
                <Box key={`option-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])]
                      newOptions[idx] = e.target.value
                      handleChange('options', newOptions)
                    }}
                    size="small"
                    placeholder={`Option ${idx + 1}`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      const newOptions = (formData.options || []).filter((_, i) => i !== idx)
                      handleChange('options', newOptions)
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const newOptions = [...(formData.options || []), '']
                  handleChange('options', newOptions)
                }}
              >
                Add Option
              </Button>
            </Box>
          </>
        )

      case FORM_ELEMENT_TYPES.RADIO:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Options
              </Typography>
              {(formData.options || []).map((option, idx) => (
                <Box key={`option-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])]
                      newOptions[idx] = e.target.value
                      handleChange('options', newOptions)
                    }}
                    size="small"
                    placeholder={`Option ${idx + 1}`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      const newOptions = (formData.options || []).filter((_, i) => i !== idx)
                      handleChange('options', newOptions)
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const newOptions = [...(formData.options || []), '']
                  handleChange('options', newOptions)
                }}
              >
                Add Option
              </Button>
            </Box>
          </>
        )

      case FORM_ELEMENT_TYPES.TEXT:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              error={!!errors.label}
              helperText={errors.label || 'Keep the label brief and unique'}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.FIGURE:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Image alternate text"
              value={formData?.alt || ''}
              onChange={(e) => handleChange('alt', e.target.value)}
              size="small"
              helperText="Text displayed when image cannot be loaded"
            />
            <TextField
              fullWidth
              label="Figure Caption"
              value={formData?.figcaption || ''}
              onChange={(e) => handleChange('figcaption', e.target.value)}
              size="small"
              helperText="Caption displayed below the image"
            />
            <TextField
              fullWidth
              label="Width (pixels, leave blank for auto)"
              type="number"
              value={formData?.width || ''}
              onChange={(e) => handleChange('width', e.target.value)}
              size="small"
              helperText="Maximum width of the image"
            />
            <Divider sx={{ my: 2 }} />
            <ImageUploader
              imageInfo={{
                src: formData?.src,
                filename: formData?.filename,
                size: formData?.size
              }}
              onImageUploaded={(imageData) => {
                handleChange('src', imageData.src)
                handleChange('filename', imageData.filename)
                handleChange('size', imageData.size)
              }}
            />
          </Box>
        )

      case FORM_ELEMENT_TYPES.PARAGRAPH:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Rows"
              type="number"
              value={formData?.rows || 3}
              onChange={(e) => handleChange('rows', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.NUMBER:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              error={!!errors.label}
              helperText={errors.label || 'Keep the label brief and unique'}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Minimum"
              type="number"
              value={formData?.min || ''}
              onChange={(e) => handleChange('min', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Maximum"
              type="number"
              value={formData?.max || ''}
              onChange={(e) => handleChange('max', e.target.value)}
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.FILE:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="File Type (leave blank for default)"
              value={formData?.filetype || ''}
              onChange={(e) => handleChange('filetype', e.target.value)}
              size="small"
              placeholder="e.g., .pdf,.doc,.docx"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.DROPDOWN:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Options
              </Typography>
              {(formData.options || []).map((option, idx) => (
                <Box key={`option-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])]
                      newOptions[idx] = e.target.value
                      handleChange('options', newOptions)
                    }}
                    size="small"
                    placeholder={`Option ${idx + 1}`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      const newOptions = (formData.options || []).filter((_, i) => i !== idx)
                      handleChange('options', newOptions)
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const newOptions = [...(formData.options || []), '']
                  handleChange('options', newOptions)
                }}
              >
                Add Option
              </Button>
            </Box>
          </>
        )

      case FORM_ELEMENT_TYPES.DATE:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.DATETIME:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.TIME:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.EMAIL:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
              placeholder="user@example.com"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.PHONE:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
              placeholder="(123) 456-7890"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.URL:
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={formData?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Placeholder"
              value={formData?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              size="small"
              placeholder="https://example.com"
            />
            <TextField
              fullWidth
              label="Help Text"
              value={formData?.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              size="small"
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.SECTION:
        return (
          <>
            <TextField
              fullWidth
              label="Section legend"
              value={formData?.legend || ''}
              onChange={(e) => handleChange('legend', e.target.value)}
              size="small"
            />
          </>
        )

      case FORM_ELEMENT_TYPES.INSTRUCTION:
        return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Instructions Content
            </Typography>
            <RichTextEditor
              value={formData.content || ''}
              onChange={(content) => handleChange('content', content)}
              height={250}
              placeholder="Enter instructions..."
            />
          </>
        )      

      default:
        return <Typography variant="body2">Unknown element type</Typography>
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit {definition?.displayName || 'Element'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {renderFields()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ElementEditDialog