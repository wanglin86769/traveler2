import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import shareService from '@/services/shareService'
import { getUsers } from '@/services/userService'
import groupService from '@/services/groupService'

const ShareSettings = ({ type, id, title, getItem }) => {
  const navigate = useNavigate()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const queryClient = useQueryClient()

  const [publicAccess, setPublicAccess] = useState('no access')
  const [newUser, setNewUser] = useState({ name: '', write: false })
  const [selectedUser, setSelectedUser] = useState(null)
  const [newGroup, setNewGroup] = useState({ id: '', write: false })
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editUserDialog, setEditUserDialog] = useState({ open: false, userId: null, username: '', access: 'read' })
  const [editGroupDialog, setEditGroupDialog] = useState({ open: false, groupId: null, groupname: '', access: 'read' })
  const [deleteUserDialog, setDeleteUserDialog] = useState({ open: false, userId: null, username: '' })
  const [deleteGroupDialog, setDeleteGroupDialog] = useState({ open: false, groupId: null, groupname: '' })

  // Fetch item data to get the title
  const { data: itemData } = useQuery({
    queryKey: [type, id],
    queryFn: () => getItem(id),
    enabled: !!id,
  })

  // Fetch sharing info
  const { data: shareData, isLoading } = useQuery({
    queryKey: [`${type}Share`, id],
    queryFn: () => shareService.getSharing(type, id),
    enabled: !!id
  })

  // Get users list
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    retry: false
  })

  const users = usersResponse?.data || []

  // Get groups list
  const { data: groupsResponse, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getGroups(),
    retry: false
  })

  const groups = groupsResponse?.data || []

  // Initialize public access when data loads
  useEffect(() => {
    if (shareData) {
      setPublicAccess(shareData.publicAccess === -1 ? 'no access' : shareData.publicAccess === 0 ? 'read' : 'write')
    }
  }, [shareData])

  // Mutations
  const updatePublicAccessMutation = useMutation({
    mutationFn: (access) => shareService.updatePublicAccess(type, id, access),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Public access updated successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update public access', severity: 'error' })
    }
  })

  const addUserMutation = useMutation({
    mutationFn: (data) => shareService.addUserToShare(type, id, data),
    onSuccess: () => {
      setNewUser({ name: '', write: false })
      setSelectedUser(null)
      setSnackbar({ open: true, message: 'User added to share list successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add user to share', severity: 'error' })
    }
  })

  const updateUserAccessMutation = useMutation({
    mutationFn: ({ userId, access }) => shareService.updateUserShareAccess(type, id, userId, access),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'User access updated successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update user access', severity: 'error' })
    }
  })

  const removeUserMutation = useMutation({
    mutationFn: (userId) => shareService.removeUserFromShare(type, id, userId),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'User removed from share list successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to remove user from share', severity: 'error' })
    }
  })

  const addGroupMutation = useMutation({
    mutationFn: (data) => shareService.addGroupToShare(type, id, data),
    onSuccess: () => {
      setNewGroup({ id: '', write: false })
      setSelectedGroup(null)
      setSnackbar({ open: true, message: 'Group added to share list successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add group to share', severity: 'error' })
    }
  })

  const updateGroupAccessMutation = useMutation({
    mutationFn: ({ groupId, access }) => shareService.updateGroupShareAccess(type, id, groupId, access),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Group access updated successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update group access', severity: 'error' })
    }
  })

  const removeGroupMutation = useMutation({
    mutationFn: (groupId) => shareService.removeGroupFromShare(type, id, groupId),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Group removed from share list successfully', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: [`${type}Share`, id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to remove group from share', severity: 'error' })
    }
  })

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  const sharedUsers = shareData?.sharedWith || []
  const sharedGroups = shareData?.sharedGroup || []

  const getTypeLabel = () => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/${type}s/${id}`)}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back
        </Button>

        {/* Public Access */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Public access for {getTypeLabel()} <Box component="span" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate(`/${type}s/${id}`)}>{title || '...'}</Box>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={publicAccess}
                  onChange={(e) => setPublicAccess(e.target.value)}
                  size="small"
                  MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                      }
                    }
                  }}
                >
                  <MenuItem value="no access">No Access</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="write">Write</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => {
                  const accessValue = publicAccess === 'no access' ? -1 : publicAccess === 'read' ? 0 : 1
                  updatePublicAccessMutation.mutate(accessValue.toString())
                }}
                disabled={updatePublicAccessMutation.isPending}
              >
                Update
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Shared Users */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shared user list for {getTypeLabel()} <Box component="span" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate(`/${type}s/${id}`)}>{title || '...'}</Box>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="User Name"
                value={newUser.name}
                onChange={(e) => {
                  setNewUser({ ...newUser, name: e.target.value })
                  setSelectedUser(null)
                }}
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newUser.write}
                    onChange={(e) => setNewUser({ ...newUser, write: e.target.checked })}
                  />
                }
                label="Write"
              />
              <Button
                variant="contained"
                onClick={() => {
                  const username = selectedUser ? selectedUser.name : newUser.name
                  addUserMutation.mutate({
                    username: username,
                    access: newUser.write ? 'write' : 'read'
                  })
                }}
                disabled={addUserMutation.isPending || !newUser.name}
              >
                Add to Share
              </Button>
            </Box>

            {/* User Suggestions */}
            {newUser.name && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {usersLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading users...
                  </Typography>
                ) : users && users.length > 0 ? (
                  users
                    .filter(user =>
                      (user.name?.toLowerCase().includes(newUser.name.toLowerCase()) ||
                       user._id?.toLowerCase().includes(newUser.name.toLowerCase())) &&
                      !sharedUsers.some(share => share._id === user._id)
                    )
                    .slice(0, 5)
                    .map(user => {
                      const isSelected = selectedUser?._id === user._id
                      return (
                        <Chip
                          key={user._id}
                          icon={<PersonIcon />}
                          label={user.name}
                          onClick={() => {
                            setSelectedUser(user)
                            setNewUser({ ...newUser, name: user.name })
                          }}
                          clickable
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ 
                            border: isSelected ? '2px solid #1976d2' : undefined
                          }}
                        />
                      )
                    })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No users found matching "{newUser.name}"
                  </Typography>
                )}
              </Box>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Privilege</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sharedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No users shared
                      </TableCell>
                    </TableRow>
                  ) : (
                    sharedUsers.map((share) => (
                      <TableRow key={share._id}>
                        <TableCell>{share._id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            {share.username}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={share.access === 1 ? 'Write' : 'Read'}
                            color={share.access === 1 ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setEditUserDialog({
                              open: true,
                              userId: share._id,
                              username: share.username,
                              access: share.access === 1 ? 'write' : 'read'
                            })}
                            title="Edit access"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteUserDialog({ open: true, userId: share._id, username: share.username })}
                            color="error"
                            title="Remove"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Shared Groups */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shared group list for {getTypeLabel()} <Box component="span" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate(`/${type}s/${id}`)}>{title || '...'}</Box>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Group ID"
                value={newGroup.id}
                onChange={(e) => {
                  setNewGroup({ ...newGroup, id: e.target.value })
                  setSelectedGroup(null)
                }}
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newGroup.write}
                    onChange={(e) => setNewGroup({ ...newGroup, write: e.target.checked })}
                  />
                }
                label="Write"
              />
              <Button
                variant="contained"
                onClick={() => {
                  const groupId = selectedGroup ? selectedGroup._id : newGroup.id
                  addGroupMutation.mutate({
                    groupId: groupId,
                    access: newGroup.write ? 'write' : 'read'
                  })
                }}
                disabled={addGroupMutation.isPending || !newGroup.id}
              >
                Add to Share
              </Button>
            </Box>

            {/* Group Suggestions */}
            {newGroup.id && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {groupsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading groups...
                  </Typography>
                ) : groups && groups.length > 0 ? (
                  groups
                    .filter(group =>
                      (group._id?.toLowerCase().includes(newGroup.id.toLowerCase()) ||
                       group.name?.toLowerCase().includes(newGroup.id.toLowerCase())) &&
                      !sharedGroups.some(share => share._id === group._id)
                    )
                    .slice(0, 5)
                    .map(group => {
                      const isSelected = selectedGroup?._id === group._id
                      return (
                        <Chip
                          key={group._id}
                          icon={<GroupIcon />}
                          label={group.name}
                          onClick={() => {
                            setSelectedGroup(group)
                            setNewGroup({ ...newGroup, id: group._id })
                          }}
                          clickable
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ 
                            border: isSelected ? '2px solid #1976d2' : undefined
                          }}
                        />
                      )
                    })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No groups found matching "{newGroup.id}"
                  </Typography>
                )}
              </Box>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group ID</TableCell>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Privilege</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sharedGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No groups shared
                      </TableCell>
                    </TableRow>
                  ) : (
                    sharedGroups.map((share) => (
                      <TableRow key={share._id}>
                        <TableCell>{share._id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon fontSize="small" />
                            {share.groupname}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={share.access === 1 ? 'Write' : 'Read'}
                            color={share.access === 1 ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setEditGroupDialog({
                              open: true,
                              groupId: share._id,
                              groupname: share.groupname,
                              access: share.access === 1 ? 'write' : 'read'
                            })}
                            title="Edit access"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteGroupDialog({ open: true, groupId: share._id, groupname: share.groupname })}
                            color="error"
                            title="Remove"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Edit User Access Dialog */}
      <Dialog open={editUserDialog.open} onClose={() => setEditUserDialog({ ...editUserDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Access</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              User: <strong>{editUserDialog.username}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select
                value={editUserDialog.access}
                label="Access Level"
                onChange={(e) => setEditUserDialog({ ...editUserDialog, access: e.target.value })}
              >
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="write">Write</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog({ ...editUserDialog, open: false })}>Cancel</Button>
          <Button
            onClick={() => {
              updateUserAccessMutation.mutate({
                userId: editUserDialog.userId,
                access: editUserDialog.access
              })
              setEditUserDialog({ ...editUserDialog, open: false })
            }}
            variant="contained"
            disabled={updateUserAccessMutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Access Dialog */}
      <Dialog open={editGroupDialog.open} onClose={() => setEditGroupDialog({ ...editGroupDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group Access</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Group: <strong>{editGroupDialog.groupname}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select
                value={editGroupDialog.access}
                label="Access Level"
                onChange={(e) => setEditGroupDialog({ ...editGroupDialog, access: e.target.value })}
              >
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="write">Write</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGroupDialog({ ...editGroupDialog, open: false })}>Cancel</Button>
          <Button
            onClick={() => {
              updateGroupAccessMutation.mutate({
                groupId: editGroupDialog.groupId,
                access: editGroupDialog.access
              })
              setEditGroupDialog({ ...editGroupDialog, open: false })
            }}
            variant="contained"
            disabled={updateGroupAccessMutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserDialog.open} onClose={() => setDeleteUserDialog({ ...deleteUserDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteUserDialog.username}</strong> from the share list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialog({ ...deleteUserDialog, open: false })}>Cancel</Button>
          <Button
            onClick={() => {
              removeUserMutation.mutate(deleteUserDialog.userId)
              setDeleteUserDialog({ ...deleteUserDialog, open: false })
            }}
            color="error"
            variant="contained"
            disabled={removeUserMutation.isPending}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={deleteGroupDialog.open} onClose={() => setDeleteGroupDialog({ ...deleteGroupDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Remove Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteGroupDialog.groupname}</strong> from the share list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupDialog({ ...deleteGroupDialog, open: false })}>Cancel</Button>
          <Button
            onClick={() => {
              removeGroupMutation.mutate(deleteGroupDialog.groupId)
              setDeleteGroupDialog({ ...deleteGroupDialog, open: false })
            }}
            color="error"
            variant="contained"
            disabled={removeGroupMutation.isPending}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ShareSettings