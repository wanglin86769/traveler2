import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@mui/material/Avatar'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material'
import userService from '@/services/userService'

const allRoles = ['admin', 'manager', 'reviewer', 'read_all_forms', 'write_active_travelers']

function User() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isReloading, setIsReloading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0 })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [newPassword, setNewPassword] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Create user form
  const [newUser, setNewUser] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    mobile: '',
    office: '',
    roles: []
  })

  // Edit user form
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    office: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [page, rowsPerPage, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search
      })
      setUsers(response.data || [])
      setPagination(response.pagination || { total: 0 })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setNewUser({
      _id: '',
      name: '',
      email: '',
      phone: '',
      mobile: '',
      office: '',
      roles: []
    })
    setSelectedRoles([])
    setCreateDialogOpen(true)
  }

  const handleSaveCreate = async () => {
    if (!newUser._id || !newUser.name || !newUser.email) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' })
      return
    }

    try {
      await userService.createUser({ ...newUser, roles: selectedRoles })
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' })
      setCreateDialogOpen(false)
      fetchUsers()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create user', severity: 'error' })
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setSelectedRoles(user.roles || [])
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      mobile: user.mobile || '',
      office: user.office || ''
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      await userService.updateUser(selectedUser._id, {
        ...editUser,
        roles: selectedRoles
      })
      
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' })
      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update user', severity: 'error' })
    }
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setResetPasswordDialogOpen(true)
  }

  const handleSaveResetPassword = async () => {
    if (!newPassword) {
      setSnackbar({ open: true, message: 'Password is required', severity: 'error' })
      return
    }

    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters long', severity: 'error' })
      return
    }

    try {
      await userService.resetPassword(selectedUser._id, { password: newPassword })
      setSnackbar({ open: true, message: 'Password reset successfully', severity: 'success' })
      setResetPasswordDialogOpen(false)
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to reset password', severity: 'error' })
    }
  }

  const confirmDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser._id)
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' })
      setDeleteDialogOpen(false)
      fetchUsers()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete user', severity: 'error' })
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Users
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Create User
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
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>User id</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Full name</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Roles</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Office</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ border: '1px solid #E0E0E0' }}>Loading...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ border: '1px solid #E0E0E0' }}>No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{user._id}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'grey.400' }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Typography>{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>{user.email}</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.roles?.map((role) => (
                            <Chip key={role} label={role} size="small" />
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <Typography variant="body2" color="text.secondary">
                              No roles
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>{user.phone || '-'}</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>{user.office || '-'}</TableCell>
                      <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                        {isAdmin && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="medium"
                                onClick={() => handleEditUser(user)}
                                sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' } }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Password">
                              <IconButton
                                size="medium"
                                onClick={() => handleResetPassword(user)}
                                sx={{ color: '#9C27B0', '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.08)' } }}
                              >
                                <VpnKeyIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="medium"
                                onClick={() => handleDeleteUser(user)}
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username *"
            value={newUser._id}
            onChange={(e) => setNewUser({ ...newUser, _id: e.target.value })}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Name *"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mobile"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Office"
            value={newUser.office}
            onChange={(e) => setNewUser({ ...newUser, office: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Roles
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {allRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={selectedRoles.indexOf(role) > -1} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Username: {selectedUser?._id}
          </Typography>

          <TextField
            fullWidth
            label="Name"
            value={editUser.name}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editUser.email}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={editUser.phone}
            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mobile"
            value={editUser.mobile}
            onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Office"
            value={editUser.office}
            onChange={(e) => setEditUser({ ...editUser, office: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Roles
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {allRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={selectedRoles.indexOf(role) > -1} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong> ({selectedUser?._id})?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteUser} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Resetting password for: {selectedUser?.name} ({selectedUser?._id})
          </Typography>
          <TextField
            fullWidth
            label="New Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            sx={{ mt: 2 }}
            helperText="Password must be at least 6 characters long"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveResetPassword} variant="contained">Reset Password</Button>
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

export default User