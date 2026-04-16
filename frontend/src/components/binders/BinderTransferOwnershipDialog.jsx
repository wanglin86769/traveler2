import { useState } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/userService'

const BinderTransferOwnershipDialog = ({ open, onClose, onConfirm, selectedBinders, currentUserId, isTransferring }) => {
  const [targetUserId, setTargetUserId] = useState('')
  const [error, setError] = useState('')

  // Fetch users for autocomplete
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: open
  })

  const filteredUsers = users.filter(
    user => user._id !== currentUserId // Cannot transfer to self
  ).slice(0, 5)

  const handleConfirm = () => {
    if (!targetUserId) {
      setError('Please select a user')
      return
    }
    setError('')
    onConfirm(targetUserId)
  }

  const handleCancel = () => {
    setTargetUserId('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Transfer the following {selectedBinders.length} binder{selectedBinders.length > 1 ? 's' : ''}?
      </DialogTitle>
      
      <DialogContent>
        {/* Selected binders list */}
        <List>
          {selectedBinders.map(binder => (
            <ListItem key={binder.id || binder._id} sx={{ py: 0.5 }}>
              <ListItemText 
                primary={binder.title} 
              />
            </ListItem>
          ))}
        </List>

        {/* Target user selection */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select the user to transfer ownership to:
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No users available
                </Typography>
              ) : (
                filteredUsers.map(user => (
                  <ListItem 
                    key={user._id} 
                    button 
                    onClick={() => {
                      setTargetUserId(user._id)
                      setError('')
                    }}
                    selected={targetUserId === user._id}
                    sx={{ 
                      border: targetUserId === user._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      mb: 1,
                      borderRadius: 1
                    }}
                  >
                    <ListItemText 
                      primary={user.name || user.username || user._id}
                      secondary={user.email || 'No email'}
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!targetUserId || isTransferring}
          color="primary"
        >
          {isTransferring ? <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BinderTransferOwnershipDialog