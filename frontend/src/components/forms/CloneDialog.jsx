import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress
} from '@mui/material'

const CloneDialog = ({
  open,
  onClose,
  onConfirm,
  selectedForms,
  isCloning
}) => {
  // Initialize titles with default values: "title clone"
  const [titles, setTitles] = useState(
    selectedForms.reduce((acc, form) => {
      acc[form._id] = `${form.title} clone`
      return acc
    }, {})
  )

  const handleTitleChange = (formId, newTitle) => {
    setTitles(prev => ({
      ...prev,
      [formId]: newTitle
    }))
  }

  const handleConfirm = () => {
    onConfirm(titles)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Clone the following {selectedForms.length} form{selectedForms.length > 1 ? 's' : ''}?
      </DialogTitle>

      <DialogContent>
        {selectedForms.map((form, index) => (
          <Box key={form._id} sx={{ mb: index < selectedForms.length - 1 ? 3 : 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              clone <b>{form.title}</b>
            </Typography>
            <TextField
              fullWidth
              label="with new title"
              value={titles[form._id]}
              onChange={(e) => handleTitleChange(form._id, e.target.value)}
              disabled={isCloning}
              size="small"
            />
          </Box>
        ))}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isCloning}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isCloning}
          startIcon={isCloning ? <CircularProgress size={20} /> : null}
        >
          {isCloning ? 'Cloning...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CloneDialog