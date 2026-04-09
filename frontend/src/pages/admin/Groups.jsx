import { useEffect, useState } from 'react'
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
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import groupService from '@/services/groupService'

function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupId, setNewGroupId] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)

  useEffect(() => {
    fetchGroups()
  }, [page, rowsPerPage, search])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await groupService.getGroups({ page: page + 1, limit: rowsPerPage, search })
      setGroups(response || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
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
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' })
      return
    }

    try {
      await groupService.createGroup({
        _id: newGroupId,
        name: newGroupName
      })
      setSnackbar({ open: true, message: 'Group created', severity: 'success' })
      setCreateDialogOpen(false)
      setNewGroupName('')
      setNewGroupId('')
      fetchGroups()
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create group', severity: 'error' })
    }
  }

  const handleDeleteGroup = async (id) => {
    setGroupToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return
    
    try {
      await groupService.deleteGroup(groupToDelete)
      setSnackbar({ open: true, message: 'Group deleted', severity: 'success' })
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Group
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Loading...</TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No groups found</TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <TableRow key={group._id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{group._id}</Typography>
                      </TableCell>
                      <TableCell>{group.name}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={<PersonIcon />} 
                          label={group.members?.length || 0} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleDeleteGroup(group._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={groups.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group ID"
            value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Group Name"
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this group?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteConfirmOpen(false); setGroupToDelete(null); }}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteGroup} variant="contained" color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Groups
