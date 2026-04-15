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
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  MenuItem,
  Tab,
  Tabs,
  IconButton
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Archive as ArchiveIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Person as PersonIcon
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
  const [selectedTravelers, setSelectedTravelers] = useState(new Set())
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [addToBinderDialogOpen, setAddToBinderDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [isReloading, setIsReloading] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)

  // Use React Query to get travelers list based on current tab
  const { data, isLoading, error } = useQuery({
    queryKey: ['travelers', currentTab, { page: page + 1, limit: rowsPerPage, search, status: statusFilter }],
    queryFn: () => {
      const params = { page: page + 1, limit: rowsPerPage, search, status: statusFilter }
      
      switch (currentTab) {
        case 0: // My travelers
          return getTravelers(params)
        case 1: // Transferred travelers
          return getTravelers({ ...params, type: 'transferred' })
        case 2: // Shared travelers
          return getTravelers({ ...params, type: 'shared' })
        case 3: // Group shared travelers
          return getTravelers({ ...params, type: 'groupShared' })
        case 4: // Archived travelers
          return getTravelers({ ...params, type: 'archived' })
        default:
          return getTravelers(params)
      }
    },
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (travelerIds) => {
      return Promise.all(travelerIds.map(id => archiveTraveler(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelers', currentTab] })
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

  const handleTransferOwnership = () => {
    if (selectedTravelers.size === 0) return
    setTransferDialogOpen(true)
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

  const getTabTitle = (tabIndex) => {
    switch (tabIndex) {
      case 0: return 'My travelers'
      case 1: return 'Transferred travelers'
      case 2: return 'Shared travelers'
      case 3: return 'Group shared travelers'
      case 4: return 'Archived travelers'
      default: return 'Travelers'
    }
  }

  const getRelativeTime = (date) => {
    if (!date) return '-'
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
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
      
        if (error) {    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography color="error">Error loading travelers: {error.message}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Travelers
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/released-forms')}
            sx={{ bgcolor: '#1890ff', '&:hover': { bgcolor: '#096dd9' } }}
          >
            Create Traveler
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => setAddToBinderDialogOpen(true)}
            disabled={selectedTravelers.size === 0}
            sx={{ bgcolor: '#1890ff', '&:hover': { bgcolor: '#096dd9' } }}
          >
            Clone
          </Button>
          <Button
            variant="contained"
            startIcon={<FolderIcon />}
            onClick={() => setAddToBinderDialogOpen(true)}
            disabled={selectedTravelers.size === 0}
            sx={{ bgcolor: '#f39c12', color: '#212121', '&:hover': { bgcolor: '#e67e22' } }}
          >
            Add to Binder
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={currentTab} onChange={(e, newValue) => {
                setCurrentTab(newValue)
                setPage(0)
                setSelectedTravelers(new Set())
              }}>
            <Tab label="My travelers" sx={{ textTransform: 'none' }} />
            <Tab label="Transferred travelers" sx={{ textTransform: 'none' }} />
            <Tab label="Shared travelers" sx={{ textTransform: 'none' }} />
            <Tab label="Group shared travelers" sx={{ textTransform: 'none' }} />
            <Tab label="Archived travelers" sx={{ textTransform: 'none' }} />
          </Tabs>

          {/* Reload table button */}
          <Box sx={{ mt: 3, mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={isReloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RefreshIcon />}
              sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#43A047' } }}
              onClick={async () => {
                setIsReloading(true)
                await queryClient.invalidateQueries({ queryKey: ['travelers', currentTab] })
                setTimeout(() => setIsReloading(false), 500)
              }}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<ArchiveIcon />}
              onClick={handleArchive}
              disabled={selectedTravelers.size === 0}
              sx={{ bgcolor: '#FF9800', color: '#212121', '&:hover': { bgcolor: '#FB8C00' } }}
            >
              Archive
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonIcon />}
              onClick={handleTransferOwnership}
              disabled={selectedTravelers.size === 0}
              sx={{ bgcolor: '#FF9800', color: '#212121', '&:hover': { bgcolor: '#FB8C00' } }}
            >
              Transfer ownership
            </Button>
          </Box>

          {/* Action bar: left side pagination config, right side search box */}
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
                  <TableCell sx={{ width: 60, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                    <Checkbox
                      indeterminate={isSomeSelected}
                      checked={isAllSelected}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ border: '1px solid #E0E0E0' }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ border: '1px solid #E0E0E0' }}>
                      No travelers found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((traveler) => (
                    <TableRow key={traveler._id} hover sx={{ backgroundColor: selectedTravelers.has(traveler._id) ? '#E3F2FD' : 'inherit' }}>
                      <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        <Checkbox
                          checked={selectedTravelers.has(traveler._id)}
                          onChange={() => handleSelectTraveler(traveler._id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{traveler.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Chip
                          label={getStatusLabel(traveler.status)}
                          size="small"
                          color={getStatusColor(traveler.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {traveler.tags && traveler.tags.length > 0 ? traveler.tags.join(', ') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {traveler.sharedWith && traveler.sharedWith.length > 0 
                            ? traveler.sharedWith.map(u => u.name || u).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {traveler.sharedGroup && traveler.sharedGroup.length > 0 
                            ? traveler.sharedGroup.map(g => g.name || g).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {getRelativeTime(traveler.createdOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {traveler.deadline
                            ? new Date(traveler.deadline).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {traveler.updatedBy?.name ? traveler.updatedBy.name.charAt(0).toUpperCase() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {getRelativeTime(traveler.updatedOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        {renderProgress(traveler)}
                      </TableCell>
                      <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/travelers/${traveler._id}`)}
                            sx={{ color: '#3B82F6', '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.08)' } }}
                            aria-label="View details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/travelers/${traveler._id}/input`)}
                            sx={{ color: '#F97316', '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.08)' } }}
                            aria-label="Enter data"
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
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

      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)}>
        <DialogTitle>Transfer Ownership</DialogTitle>
        <DialogContent>
          <Typography>
            Select a user to transfer ownership of {selectedTravelers.size} traveler(s) to.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => {
              setTransferDialogOpen(false)
              // TODO: Implement transfer ownership logic
            }}
          >
            Transfer
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
