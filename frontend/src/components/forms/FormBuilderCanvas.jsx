import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Box, Typography, Paper } from '@mui/material'
import FormElementWrapper from './elements/FormElementWrapper'

function FormBuilderCanvas({ elements, selectedElementIndex, onSelectElement, onUpdateElement, onDeleteElement, onEditElement, onCopyElement }) {
  const { setNodeRef } = useDroppable({
    id: 'canvas'
  })

  return (
    <Paper
      ref={setNodeRef}
      onClick={(e) => {
        // Check if the click target is the paper itself (not an element)
        if (e.target === e.currentTarget) {
          onSelectElement(null)
        }
      }}
      sx={{
        minHeight: 400,
        p: 2,
        bgcolor: 'background.paper',
        border: '2px dashed',
        borderColor: 'grey.400',
        transition: 'all 0.2s',
        cursor: elements.length > 0 ? 'pointer' : 'default'
      }}
    >
      {elements.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add form elements from the palette
          </Typography>
          <Typography variant="body2">
            Click on elements in the palette to add them
          </Typography>
        </Box>
      ) : (
        <SortableContext
          items={elements.map((element, idx) => element.name || idx.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {elements.map((element, index) => (
              <FormElementWrapper
                key={element.name}
                element={element}
                index={index}
                isSelected={selectedElementIndex === index}
                onSelect={onSelectElement}
                onUpdate={onUpdateElement}
                onDelete={onDeleteElement}
                onEdit={onEditElement}
                onCopy={onCopyElement}
              />
            ))}
          </Box>
        </SortableContext>
      )}
    </Paper>
  )
}

export default FormBuilderCanvas
