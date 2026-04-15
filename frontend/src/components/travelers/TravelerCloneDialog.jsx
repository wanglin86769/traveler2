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

const TravelerCloneDialog = ({
  open,
  onClose,
  onConfirm,
  selectedTravelers,
  isCloning
}) => {
  // Initialize titles with default values: "title clone"
  const [titles, setTitles] = useState(
    selectedTravelers.reduce((acc, traveler) => {
      acc[traveler._id] = `${traveler.title} clone`
      return acc
    }, {})
  )

  const handleTitleChange = (travelerId, newTitle) => {
    setTitles(prev => ({
      ...prev,
      [travelerId]: newTitle
    }))
  }

  const handleConfirm = () => {
    onConfirm(titles)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Clone the following {selectedTravelers.length} traveler{selectedTravelers.length > 1 ? 's' : ''}?
      </DialogTitle>

      <DialogContent>
        {selectedTravelers.map((traveler, index) => (
          <Box key={traveler._id} sx={{ mb: index < selectedTravelers.length - 1 ? 3 : 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              clone <b>{traveler.title}</b>
            </Typography>
            <TextField
              fullWidth
              label="with new title"
              value={titles[traveler._id]}
              onChange={(e) => handleTitleChange(traveler._id, e.target.value)}
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

export default TravelerCloneDialog