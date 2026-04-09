import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon
} from '@mui/icons-material'
import { getBinders, createBinder as createBinderApi } from '@/services/binderService'
import AddToBinderDialog from '@/components/common/AddToBinderDialog'

function Binders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBinderTitle, setNewBinderTitle] = useState('')
  const [newBinderDescription, setNewBinderDescription] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [selectedBinders, setSelectedBinders] = useState(new Set())
  const [addToBinderDialogOpen, setAddToBinderDialogOpen] = useState(false)

  // Use React Query to get binders list
  const { data, isLoading, error } = useQuery({
    queryKey: ['binders', { page: page + 1, limit: rowsPerPage, search }],
    queryFn: () => getBinders({ page: page + 1, limit: rowsPerPage, search }),
  })

  const items = data?.data || []
  const pagination = data?.pagination || {}

  // Mutation to create binder
  const createMutation = useMutation({
    mutationFn: (data) => createBinderApi(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['binders'] })
      setSnackbar({ open: true, message: 'Binder created successfully', severity: 'success' })
      setCreateDialogOpen(false)
      setNewBinderTitle('')
      setNewBinderDescription('')
      // Stay on list page, don't navigate to detail page
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create binder', severity: 'error' })
    }
  })

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCreateBinder = () => {
    if (!newBinderTitle.trim()) {
      setSnackbar({ open: true, message: 'Title is required', severity: 'error' })
      return
    }

    createMutation.mutate({
      title: newBinderTitle,
      description: newBinderDescription
    })
  }

  const handleSelectBinder = (binderId) => {
    setSelectedBinders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(binderId)) {
        newSet.delete(binderId)
      } else {
        newSet.add(binderId)
      }
      return newSet
    })
  }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = items.map(item => item._id)
      setSelectedBinders(new Set(allIds))
    } else {
      setSelectedBinders(new Set())
    }
  }

  const isAllSelected = items.length > 0 && selectedBinders.size === items.length
  const isSomeSelected = selectedBinders.size > 0 && selectedBinders.size < items.length

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'default'
      case 1: return 'primary'
      case 2: return 'success'
      case 3: return 'default'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return 'New'
      case 1: return 'Active'
      case 2: return 'Completed'
      case 3: return 'Archived'
      default: return 'Unknown'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Binders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Binder
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search binders..."
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

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FolderIcon />}
              onClick={() => setAddToBinderDialogOpen(true)}
              disabled={selectedBinders.size === 0}
            >
              Add to Binder ({selectedBinders.size})
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={isSomeSelected}
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="error">Error: {error.message}</Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No binders found</TableCell>
                  </TableRow>
                ) : (
                  items.map((binder) => (
                    <TableRow key={binder._id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedBinders.has(binder._id)}
                          onChange={() => handleSelectBinder(binder._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{binder.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(binder.status)}
                          size="small"
                          color={getStatusColor(binder.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={binder.progress || 0}
                            sx={{ width: 100 }}
                          />
                          <Typography variant="body2">
                            {binder.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{binder.works?.length || 0}</TableCell>
                      <TableCell>{binder.createdBy?.name || binder.createdBy}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => navigate(`/binders/${binder._id}`)}>
                          View
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
            count={pagination.total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Binder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newBinderTitle}
            onChange={(e) => setNewBinderTitle(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newBinderDescription}
            onChange={(e) => setNewBinderDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBinder} 
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <AddToBinderDialog
        open={addToBinderDialogOpen}
        onClose={() => setAddToBinderDialogOpen(false)}
        itemIds={Array.from(selectedBinders)}
        itemType="binder"
        sourceItem={selectedBinders.size === 1 ? items.find(item => selectedBinders.has(item._id)) : null}
      />

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

export default Binders
