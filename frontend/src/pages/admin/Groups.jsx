import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon
} from '@mui/icons-material'
import groupService from '@/services/groupService'
import userService from '@/services/userService'

function Groups() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin')

  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ total: 0 })
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupToDelete, setGroupToDelete] = useState(null)
  
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupId, setNewGroupId] = useState('')
  const [editGroupName, setEditGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchGroups()
  }, [page, rowsPerPage, search])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await groupService.getGroups({ page: page + 1, limit: rowsPerPage, search })
      setGroups(response.data || [])
      setPagination(response.pagination || { total: 0 })
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      setSnackbar({ open: true, message: 'Failed to fetch groups', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ page: 1, limit: 1000 })
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName || !newGroupId) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' })
      return
    }

    try {
      await groupService.createGroup({
        _id: newGroupId,
        name: newGroupName,
        members: []
      })
      setSnackbar({ open: true, message: 'Group created successfully', severity: 'success' })
      setCreateDialogOpen(false)
      setNewGroupName('')
      setNewGroupId('')
      fetchGroups()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create group', severity: 'error' })
    }
  }

  const handleEditGroup = (group) => {
    setSelectedGroup(group)
    setEditGroupName(group.name)
    setSelectedMembers(group.members || [])
    setEditDialogOpen(true)
    fetchUsers()
  }

  const handleSaveEdit = async () => {
    try {
      await groupService.updateGroup(selectedGroup._id, {
        name: editGroupName,
        members: selectedMembers
      })
      setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' })
      setEditDialogOpen(false)
      fetchGroups()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update group', severity: 'error' })
    }
  }

  const handleAddMember = (userId) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId))
  }

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return
    
    try {
      await groupService.deleteGroup(groupToDelete._id)
      setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' })
      fetchGroups()
      setDeleteConfirmOpen(false)
      setGroupToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete group', severity: 'error' })
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Groups
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Group
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {/* Action bar: left side item count config, right side search box */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                sx={{ width: 80, height: '32px' }}
                InputProps={{ sx: { height: '32px' } }}
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </TextField>
              <Typography variant="body2">Rows per page</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Search:</Typography>
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 200, height: '32px' }}
                InputProps={{ sx: { height: '32px' } }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ border: '1px solid #E0E0E0' }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Group ID</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Members</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ border: '1px solid #E0E0E0' }}>Loading...</TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ border: '1px solid #E0E0E0' }}>No groups found</TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <TableRow key={group._id} hover>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{group._id}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>{group.name}</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {group.members?.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No members</Typography>
                          ) : (
                            group.members.map((member) => {
                              const memberName = typeof member === 'object' ? member.name : member
                              return (
                                <Chip key={typeof member === 'object' ? member._id : member} label={memberName} size="small" />
                              )
                            })
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                        {isAdmin && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Group">
                              <IconButton
                                size="medium"
                                onClick={() => handleEditGroup(group)}
                                sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' } }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Group">
                              <IconButton
                                size="medium"
                                onClick={() => handleDeleteGroup(group)}
                                sx={{ color: '#F44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' } }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Bottom status bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {pagination.total > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, pagination.total)} of {pagination.total} entries
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1 }}>
              <Button
                size="small"
                onClick={() => handleChangePage(null, 0)}
                disabled={page === 0}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                First
              </Button>
              <Button
                size="small"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'center' }}>{page + 1}</Typography>
              <Button
                size="small"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={(page + 1) * rowsPerPage >= pagination.total}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Next
              </Button>
              <Button
                size="small"
                onClick={() => handleChangePage(null, Math.ceil(pagination.total / rowsPerPage) - 1)}
                disabled={(page + 1) * rowsPerPage >= pagination.total}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Last
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group ID *"
            value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Group Name *"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Group ID: {selectedGroup?._id}
          </Typography>
          
          <TextField
            fullWidth
            label="Group Name"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            sx={{ mt: 2, mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Add Member
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddMember(e.target.value)}
                label="Select User"
              >
                {users
                  .filter(user => !selectedMembers.includes(user._id))
                  .map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user._id})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Members ({selectedMembers.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No members</Typography>
            ) : (
              selectedMembers.map((memberId) => {
                const member = users.find(u => u._id === memberId)
                return (
                  <Chip
                    key={memberId}
                    label={member?.name || memberId}
                    size="small"
                    onDelete={() => handleRemoveMember(memberId)}
                    deleteIcon={<DeleteOutlineIcon />}
                    sx={{
                      backgroundColor: 'transparent',
                      border: '1px solid #E0E0E0',
                      '& .MuiChip-deleteIcon': {
                        color: 'error.main',
                        fontSize: '18px',
                        marginLeft: '8px',
                        marginRight: '-8px',
                        '&:hover': {
                          backgroundColor: 'error.main',
                          color: 'white'
                        }
                      }
                    }}
                  />
                )
              })
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete group <strong>{groupToDelete?.name}</strong> ({groupToDelete?._id})?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteConfirmOpen(false); setGroupToDelete(null); }}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteGroup} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{
          top: '80px'
        }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Groups
