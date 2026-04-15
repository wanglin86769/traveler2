import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Checkbox,
  IconButton,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material'
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { getPublicTravelers } from '@/services/travelerService'
import AddToBinderDialog from '@/components/common/AddToBinderDialog'

const PublicTravelers = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedTravelers, setSelectedTravelers] = useState(new Set())
  const [addToBinderDialogOpen, setAddToBinderDialogOpen] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const { data: response = {}, isLoading, error, refetch } = useQuery({
    queryKey: ['publicTravelers', search, page, rowsPerPage],
    queryFn: () => getPublicTravelers({ search, page: page + 1, limit: rowsPerPage }),
    staleTime: 5 * 60 * 1000
  })

  const items = response.data || []
  const pagination = response.pagination || {}

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = items.map(item => item._id)
      setSelectedTravelers(new Set(allIds))
    } else {
      setSelectedTravelers(new Set())
    }
  }

  const handleSelectTraveler = (id) => {
    const newSelected = new Set(selectedTravelers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTravelers(newSelected)
  }

  const handleSearch = (event) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleAddToBinder = () => {
    if (selectedTravelers.size === 0) {
      setSnackbar({ open: true, message: 'Please select at least one traveler', severity: 'warning' })
      return
    }
    setAddToBinderDialogOpen(true)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleReloadTable = async () => {
    setIsReloading(true)
    await refetch()
    setTimeout(() => setIsReloading(false), 500)
  }

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

  const formatProgress = (item) => {
    const total = item.totalInput || 0
    const finished = item.finishedInput || 0
    return `${finished} / ${total}`
  }

  const renderProgress = (traveler) => {
    const { status, totalInput, finishedInput } = traveler
    
    // Completed status (status === 2)
    if (status === 2) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 100, height: 20, bgcolor: '#4CAF50', borderRadius: 1 }} />
        </Box>
      )
    }
    
    // No totalInput field
    if (totalInput === undefined || totalInput === null) {
      return <Typography variant="body2">unknown</Typography>
    }
    
    // totalInput is 0
    if (totalInput === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 100, 
            height: 20, 
            bgcolor: status === 1 ? '#FFEB3B' : '#E0E0E0',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#000', fontSize: 12 }}>0 / {totalInput || 0}</Typography>
          </Box>
        </Box>
      )
    }
    
    const finished = finishedInput || 0
    const inProgressPercentage = Math.floor((finished / totalInput) * 100)
    
    if (inProgressPercentage === 100) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 100, 
            height: 20, 
            bgcolor: '#4CAF50', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#fff', fontSize: 12 }}>{finished} / {totalInput}</Typography>
          </Box>
        </Box>
      )
    }
    
    // Normal status: dual-color progress bar (blue for completed + yellow/gray for in-progress)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 100, 
          height: 20, 
          bgcolor: status === 1 ? '#FFEB3B' : '#E0E0E0',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${inProgressPercentage}%`,
            bgcolor: 'rgba(33, 150, 243, 0.3)',
            zIndex: 1
          }} />
          <Typography variant="body2" sx={{ color: status === 1 ? '#000' : '#000', fontSize: 12, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {finished} / {totalInput}
          </Typography>
        </Box>
      </Box>
    )
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Public Accessible Travelers
        </Typography>
        <Button
          variant="contained"
          onClick={handleAddToBinder}
          disabled={selectedTravelers.size === 0}
          startIcon={<FolderIcon />}
          sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#43A047' } }}
        >
          Add to Binder
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mt: 3, mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={isReloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RefreshIcon />}
              sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#43A047' } }}
              onClick={handleReloadTable}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
          </Box>

          {/* Pagination config and search */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                select
                size="small"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
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
                onChange={handleSearch}
                sx={{ width: 200, height: '32px' }}
                InputProps={{ sx: { height: '32px' } }}
              />
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading public travelers...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="error">
                Error loading travelers: {String(error)}
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                No public travelers found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ border: '1px solid #E0E0E0' }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                    <TableCell sx={{ width: 60, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                      <Checkbox
                        indeterminate={selectedTravelers.size > 0 && selectedTravelers.size < items.length}
                        checked={items.length > 0 && selectedTravelers.size === items.length}
                        onChange={handleSelectAll}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Tags</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Shared with</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Shared groups</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Created</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Deadline</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Filled by</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Updated</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Estimated progress</TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item._id}
                      hover
                      sx={{ backgroundColor: selectedTravelers.has(item._id) ? '#E3F2FD' : 'inherit' }}
                    >
                      <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        <Checkbox
                          checked={selectedTravelers.has(item._id)}
                          onChange={() => handleSelectTraveler(item._id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{item.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Chip
                          label={getStatusLabel(item.status)}
                          size="small"
                          color={getStatusColor(item.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {item.tags && item.tags.length > 0 ? item.tags.join(', ') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {item.sharedWith && item.sharedWith.length > 0 
                            ? item.sharedWith.map(u => u.username || u.name || u).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {item.sharedGroup && item.sharedGroup.length > 0 
                            ? item.sharedGroup.map(g => g.groupname || g.name || g).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {formatTimeAgo(item.createdOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {item.deadline
                            ? new Date(item.deadline).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {item.updatedBy?.name ? item.updatedBy.name.charAt(0).toUpperCase() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {formatTimeAgo(item.updatedOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        {renderProgress(item)}
                      </TableCell>
                      <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="medium"
                            onClick={() => navigate(`/travelers/${item._id}`)}
                            sx={{ color: '#1A73E8', '&:hover': { backgroundColor: 'rgba(26, 115, 232, 0.08)' } }}
                            aria-label="View details"
                            title="View details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Bottom pagination bar */}
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

      <AddToBinderDialog
        open={addToBinderDialogOpen}
        onClose={() => setAddToBinderDialogOpen(false)}
        itemIds={Array.from(selectedTravelers)}
        itemType="traveler"
        sourceItem={selectedTravelers.size === 1 
          ? items.find(item => selectedTravelers.has(item._id)) 
          : items.filter(item => selectedTravelers.has(item._id))
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PublicTravelers