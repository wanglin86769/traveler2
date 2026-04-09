import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  DragIndicator,
  Delete,
  Edit,
  ContentCopy
} from '@mui/icons-material'
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer'

function FormElementWrapper({ element, index, isSelected, onSelect, onUpdate, onDelete, onEdit, onCopy }) {
  if (!element) {
    return null
  }

  if (!element.type) {
    return null
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: element.name || index })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleValueChange = (elementId, value) => {
    // Edit mode does not need to handle value changes
    console.log('Value changed in edit mode:', elementId, value)
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(index)
      }}
      className="form-element"
      data-element-index={index}
      sx={{
        position: 'relative',
        mb: 1,
        py: 0.5,
        px: 1,
        borderRadius: 1,
        border: '1px solid transparent',
        bgcolor: 'transparent',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
          '& .action-buttons': {
            opacity: 1,
            visibility: 'visible'
          }
        }
      }}
    >
      {/* Form element display - single row with number, label, input and action buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          py: '4px',
          width: '100%'
        }}
      >
        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          className="action-buttons"
          sx={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: isDragging ? 'primary.main' : 'text.disabled',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            padding: '4px',
            visibility: isDragging ? 'visible' : 'hidden',
            opacity: isDragging ? 1 : 0,
            transition: 'opacity 0.2s, visibility 0.2s',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          <DragIndicator fontSize="medium" />
        </Box>

        {/* Element display */}
        <InputFieldRenderer
          element={element}
          value={null}
          onChange={handleValueChange}
          disabled={true}
          mode="edit"
        />

        {/* Action buttons - on the right, outside input, only show on hover */}
        <Box
          className="action-buttons"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            ml: 'auto',
            flexShrink: 0,
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                if (element) {
                  onEdit(element, index)
                } else {
                  console.warn('FormElementWrapper: onEdit called with undefined element')
                }
              }}
              sx={{
                color: 'white',
                backgroundColor: '#2196F3',
                p: 0.5,
                width: '36px',
                height: '36px',
                '&:hover': {
                  backgroundColor: '#1976D3'
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Copy">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onCopy(element)
              }}
              sx={{
                color: 'white',
                backgroundColor: '#64B5F6',
                p: 0.5,
                width: '36px',
                height: '36px',
                '&:hover': {
                  backgroundColor: '#42A5F5'
                }
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(index)
              }}
              sx={{
                color: 'white',
                backgroundColor: '#FF9800',
                p: 0.5,
                width: '36px',
                height: '36px',
                '&:hover': {
                  backgroundColor: '#F57C00'
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}


export default React.memo(FormElementWrapper, (prevProps, nextProps) => {
  if (!nextProps.element) return false
  if (!prevProps.element) return true

  // Use JSON.stringify to compare the entire element object
  // This ensures all fields (including nested ones like options, width, alt, figcaption) are compared
  const prevElementStr = JSON.stringify(prevProps.element)
  const nextElementStr = JSON.stringify(nextProps.element)

  return (
    prevElementStr === nextElementStr &&
    prevProps.index === nextProps.index &&
    prevProps.isSelected === nextProps.isSelected
  )
})