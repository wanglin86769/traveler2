import React, { useState } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  List, 
  ListItem, 
  ListItemText,
  Divider,
  TextField,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/userService'

const BinderTransferOwnershipDialog = ({ open, onClose, onConfirm, selectedBinders, currentUserId, isTransferring }) => {
  const [targetUserName, setTargetUserName] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  // Get users list
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    retry: false,
    enabled: open
  })

  const users = usersResponse?.data || []

  const handleCancel = () => {
    setTargetUserName('')
    setSelectedUser(null)
    onClose()
  }

  const handleConfirm = () => {
    if (!selectedUser) return
    
    onConfirm(selectedUser._id)
    handleCancel()
  }

  const filteredUsers = users
    .filter(user =>
      (user.name?.toLowerCase().includes(targetUserName.toLowerCase()) ||
       user._id?.toLowerCase().includes(targetUserName.toLowerCase())) &&
      user._id !== currentUserId // Cannot transfer to self
    )
    .slice(0, 5)

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
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          to the following user
        </Typography>
        
        {/* User search input */}
        <TextField
          label="Search User"
          placeholder="Type user name or ID to search..."
          value={targetUserName}
          onChange={(e) => {
            setTargetUserName(e.target.value)
            setSelectedUser(null)
          }}
          fullWidth
          size="small"
          disabled={isTransferring}
        />
        
        {/* User suggestions */}
        {targetUserName && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {usersLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading users...
              </Typography>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isSelected = selectedUser?._id === user._id
                return (
                  <Chip
                    key={user._id}
                    icon={<PersonIcon />}
                    label={user.name}
                    onClick={() => !isTransferring && setSelectedUser(user)}
                    clickable
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      opacity: isTransferring ? 0.6 : 1,
                      cursor: isTransferring ? 'not-allowed' : 'pointer'
                    }}
                  />
                )
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No users found matching "{targetUserName}"
              </Typography>
            )}
          </Box>
        )}
        
        {/* Selected user info */}
        {selectedUser && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Selected: {selectedUser.name} ({selectedUser._id})
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleCancel}
          disabled={isTransferring}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!selectedUser || isTransferring}
          startIcon={isTransferring ? <CircularProgress size={20} /> : null}
        >
          {isTransferring ? 'Transferring...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BinderTransferOwnershipDialog