import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Archive as ArchiveIcon,
  Folder as FolderIcon
} from '@mui/icons-material'
import { getTravelers, archiveTraveler } from '@/services/travelerService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AddToBinderDialog from '@/components/common/AddToBinderDialog'

function Travelers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTraveler, setSelectedTraveler] = useState(null)
  const [selectedTravelers, setSelectedTravelers] = useState(new Set())
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [addToBinderDialogOpen, setAddToBinderDialogOpen] = useState(false)

  // Use React Query to get travelers list
  const { data, isLoading, error } = useQuery({
    queryKey: ['travelers', { page: page + 1, limit: rowsPerPage, search, status: statusFilter }],
    queryFn: () => getTravelers({ page: page + 1, limit: rowsPerPage, search, status: statusFilter }),
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (travelerIds) => {
      return Promise.all(travelerIds.map(id => archiveTraveler(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelers'] })
      setSelectedTravelers(new Set())
      setArchiveDialogOpen(false)
    },
    onError: (error) => {
      console.error('Archive error:', error)
    }
  })

  const items = data?.data || []
  const pagination = data?.pagination || {}

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleMenuOpen = (event, traveler) => {
    setAnchorEl(event.currentTarget)
    setSelectedTraveler(traveler)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTraveler(null)
  }

  const handleSelectTraveler = (travelerId) => {
    setSelectedTravelers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(travelerId)) {
        newSet.delete(travelerId)
      } else {
        newSet.add(travelerId)
      }
      return newSet
    })
  }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = items.map(item => item._id)
      setSelectedTravelers(new Set(allIds))
    } else {
      setSelectedTravelers(new Set())
    }
  }

  const handleArchive = () => {
    if (selectedTravelers.size === 0) return
    setArchiveDialogOpen(true)
  }

  const handleConfirmArchive = () => {
    archiveMutation.mutate(Array.from(selectedTravelers))
  }

  const isAllSelected = items.length > 0 && selectedTravelers.size === items.length
  const isSomeSelected = selectedTravelers.size > 0 && selectedTravelers.size < items.length

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'default'
      case 1: return 'primary'
      case 1.5: return 'warning'
      case 2: return 'success'
      case 3: return 'error'
      case 4: return 'default'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return 'Initialized'
      case 1: return 'Active'
      case 1.5: return 'Submitted'
      case 2: return 'Completed'
      case 3: return 'Frozen'
      case 4: return 'Archived'
      default: return 'Unknown'
    }
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography color="error">Error loading travelers: {error.message}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Travelers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/released-forms')}
        >
          Create Traveler
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search travelers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Initialized</MenuItem>
              <MenuItem value="1">Active</MenuItem>
              <MenuItem value="1.5">Submitted</MenuItem>
              <MenuItem value="2">Completed</MenuItem>
            </TextField>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ArchiveIcon />}
              onClick={handleArchive}
              disabled={selectedTravelers.size === 0}
            >
              Archive ({selectedTravelers.size})
            </Button>
            <Button
              variant="contained"
              startIcon={<FolderIcon />}
              onClick={() => setAddToBinderDialogOpen(true)}
              disabled={selectedTravelers.size === 0}
            >
              Add to Binder ({selectedTravelers.size})
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
                  <TableCell>Created By</TableCell>
                  <TableCell>Deadline</TableCell>
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
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No travelers found</TableCell>
                  </TableRow>
                ) : (
                  items.map((traveler) => (
                    <TableRow key={traveler._id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTravelers.has(traveler._id)}
                          onChange={() => handleSelectTraveler(traveler._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{traveler.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(traveler.status)}
                          size="small"
                          color={getStatusColor(traveler.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={traveler.progress || 0}
                            sx={{ width: 100 }}
                          />
                          <Typography variant="body2">
                            {traveler.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{traveler.createdBy?.name || traveler.createdBy}</TableCell>
                      <TableCell>
                        {traveler.deadline
                          ? new Date(traveler.deadline).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, traveler)}>
                          <MoreIcon />
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/travelers/${selectedTraveler?._id}`); handleMenuClose() }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/travelers/${selectedTraveler?._id}/input`); handleMenuClose() }}>
          Enter Data
        </MenuItem>
      </Menu>

      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <DialogTitle>Archive Travelers</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive {selectedTravelers.size} traveler(s)?
            Only the owner will be able to see them after archiving.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmArchive} 
            variant="contained" 
            color="warning"
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? 'Archiving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <AddToBinderDialog
        open={addToBinderDialogOpen}
        onClose={() => setAddToBinderDialogOpen(false)}
        itemIds={Array.from(selectedTravelers)}
        itemType="traveler"
        sourceItem={selectedTravelers.size === 1 ? items.find(item => selectedTravelers.has(item._id)) : null}
      />
    </Box>
  )
}

export default Travelers
