import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox,
  MenuItem
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { 
  getMyBinders, 
  getTransferredBinders, 
  getSharedBinders, 
  getGroupSharedBinders, 
  getArchivedBinders,
  createBinder as createBinderApi,
  archiveBinder,
  dearchiveBinder,
  transferOwnership
} from '@/services/binderService'
import AddToBinderDialog from '@/components/common/AddToBinderDialog'
import BinderTransferOwnershipDialog from '@/components/binders/BinderTransferOwnershipDialog'

function MyBinders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedBinders, setSelectedBinders] = useState(new Set())
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [dearchiveDialogOpen, setDearchiveDialogOpen] = useState(false)
  const [addToBinderDialogOpen, setAddToBinderDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBinderTitle, setNewBinderTitle] = useState('')
  const [newBinderDescription, setNewBinderDescription] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  const [isReloading, setIsReloading] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Tab definitions
  const tabs = [
    { label: 'My binders', api: getMyBinders },
    { label: 'Transferred binders', api: getTransferredBinders },
    { label: 'Shared binders', api: getSharedBinders },
    { label: 'Group shared binders', api: getGroupSharedBinders },
    { label: 'Archived binders', api: getArchivedBinders }
  ]

  // Use React Query to get binders list based on current tab
  const { data, isLoading, error } = useQuery({
    queryKey: ['binders', currentTab, { page: page + 1, limit: rowsPerPage, search, status: statusFilter }],
    queryFn: () => tabs[currentTab].api({ page: page + 1, limit: rowsPerPage, search, status: statusFilter }),
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (binderIds) => {
      return Promise.all(binderIds.map(id => archiveBinder(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] })
      setSelectedBinders(new Set())
      setArchiveDialogOpen(false)
      setSnackbar({ open: true, message: 'Binders archived successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Archive error:', error)
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to archive binders', severity: 'error' })
    }
  })

  // Dearchive mutation
  const dearchiveMutation = useMutation({
    mutationFn: (binderIds) => {
      return Promise.all(binderIds.map(id => dearchiveBinder(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] })
      setSelectedBinders(new Set())
      setDearchiveDialogOpen(false)
      setSnackbar({ open: true, message: 'Binders dearchived successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Dearchive error:', error)
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to dearchive binders', severity: 'error' })
    }
  })

  // Transfer ownership mutation
  const transferOwnershipMutation = useMutation({
    mutationFn: (userId) => {
      return transferOwnership(Array.from(selectedBinders), userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] })
      setSelectedBinders(new Set())
      setTransferDialogOpen(false)
      setSnackbar({ open: true, message: 'Ownership transferred successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Transfer ownership error:', error)
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to transfer ownership', severity: 'error' })
    }
  })

  // Create binder mutation
  const createMutation = useMutation({
    mutationFn: (data) => createBinderApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] })
      setSnackbar({ open: true, message: 'Binder created successfully', severity: 'success' })
      setCreateDialogOpen(false)
      setNewBinderTitle('')
      setNewBinderDescription('')
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create binder', severity: 'error' })
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

  const handleArchive = () => {
    if (selectedBinders.size === 0) return
    setArchiveDialogOpen(true)
  }

  const handleConfirmArchive = () => {
    archiveMutation.mutate(Array.from(selectedBinders))
  }

  const handleDearchive = () => {
    if (selectedBinders.size === 0) return
    setDearchiveDialogOpen(true)
  }

  const handleConfirmDearchive = () => {
    dearchiveMutation.mutate(Array.from(selectedBinders))
  }

  const handleTransferOwnership = () => {
    if (selectedBinders.size === 0) return
    setTransferDialogOpen(true)
  }

  const handleConfirmTransfer = (userId) => {
    transferOwnershipMutation.mutate(userId)
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

  const isAllSelected = items.length > 0 && selectedBinders.size === items.length
  const isSomeSelected = selectedBinders.size > 0 && selectedBinders.size < items.length

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
      case 0: return 'My binders'
      case 1: return 'Transferred binders'
      case 2: return 'Shared binders'
      case 3: return 'Group shared binders'
      case 4: return 'Archived binders'
      default: return 'Binders'
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

  const renderWorkProgress = (binder) => {
    const { status, totalWork, finishedWork, totalInput, finishedInput } = binder
    
    // Completed status (status === 2)
    if (status === 2) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 100, height: 20, bgcolor: '#4CAF50', borderRadius: 1 }} />
        </Box>
      )
    }
    
    // No totalWork field
    if (totalWork === undefined || totalWork === null) {
      return <Typography variant="body2">unknown</Typography>
    }
    
    // totalWork is 0
    if (totalWork === 0) {
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
            <Typography variant="body2" sx={{ color: '#000', fontSize: 12 }}>0 / {totalWork || 0}</Typography>
          </Box>
        </Box>
      )
    }
    
    const finished = finishedWork || 0
    const inProgress = (totalInput || 0) > 0 ? (finishedInput || 0) / (totalInput || 0) : 0
    const finishedPercentage = Math.floor((finished / totalWork) * 100)
    const inProgressPercentage = Math.floor(inProgress * 100)
    
    if (finishedPercentage === 100) {
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
            <Typography variant="body2" sx={{ color: '#fff', fontSize: 12 }}>{finished} / {totalWork}</Typography>
          </Box>
        </Box>
      )
    }
    
    // Normal status: dual-color progress bar (green for finished + blue for in-progress)
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
            width: `${finishedPercentage}%`,
            bgcolor: '#4CAF50',
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute',
            left: `${finishedPercentage}%`,
            top: 0,
            bottom: 0,
            width: `${inProgressPercentage}%`,
            bgcolor: 'rgba(33, 150, 243, 0.7)',
            zIndex: 1
          }} />
          <Typography variant="body2" sx={{ color: '#000', fontSize: 12, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {finished} / {totalWork} + {finishedInput || 0} / {totalInput || 0}
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography color="error">Error loading binders: {error.message}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Binders
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ bgcolor: '#1890ff', '&:hover': { bgcolor: '#096dd9' } }}
          >
            Create Binder
          </Button>
          <Button
            variant="contained"
            startIcon={<FolderIcon />}
            onClick={() => setAddToBinderDialogOpen(true)}
            disabled={selectedBinders.size === 0}
            sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#43A047' } }}
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
                setSelectedBinders(new Set())
              }}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} sx={{ textTransform: 'none' }} />
            ))}
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
                await queryClient.invalidateQueries({ queryKey: ['binders', currentTab] })
                setTimeout(() => setIsReloading(false), 500)
              }}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
            {currentTab !== 4 && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ArchiveIcon />}
                  onClick={handleArchive}
                  disabled={selectedBinders.size === 0}
                  sx={{ bgcolor: '#ef4444', color: 'white', '&:hover': { bgcolor: '#dc2626' } }}
                >
                  Archive
                </Button>
                {(currentTab === 0 || currentTab === 1) && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonIcon />}
                    onClick={handleTransferOwnership}
                    disabled={selectedBinders.size === 0}
                    sx={{ bgcolor: '#FF9800', color: 'white', '&:hover': { bgcolor: '#F57C00' } }}
                  >
                    Transfer ownership
                  </Button>
                )}
              </>
            )}
            {currentTab === 4 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ArchiveIcon />}
                onClick={handleDearchive}
                disabled={selectedBinders.size === 0}
                sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#43A047' } }}
              >
                De-archive
              </Button>
            )}
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
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Updated by</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Updated</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Work progress</TableCell>
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
                      No binders found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((binder) => (
                    <TableRow key={binder._id} hover sx={{ backgroundColor: selectedBinders.has(binder._id) ? '#E3F2FD' : 'inherit' }}>
                      <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        <Checkbox
                          checked={selectedBinders.has(binder._id)}
                          onChange={() => handleSelectBinder(binder._id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{binder.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Chip
                          label={getStatusLabel(binder.status)}
                          size="small"
                          color={getStatusColor(binder.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {binder.tags && binder.tags.length > 0 ? binder.tags.join(', ') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {binder.sharedWith && binder.sharedWith.length > 0 
                            ? binder.sharedWith.map(u => u.username || u.name || u).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {binder.sharedGroup && binder.sharedGroup.length > 0 
                            ? binder.sharedGroup.map(g => g.groupname || g.name || g).join(', ') 
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {getRelativeTime(binder.createdOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {binder.updatedBy?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {getRelativeTime(binder.updatedOn)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        {renderWorkProgress(binder)}
                      </TableCell>
                      <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/binders/${binder._id}`)}
                            sx={{ color: '#1A73E8', '&:hover': { backgroundColor: 'rgba(26, 115, 232, 0.08)' } }}
                            aria-label="View details"
                            title="View details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/binders/${binder._id}/edit`)}
                            sx={{ color: '#FB8C00', '&:hover': { backgroundColor: 'rgba(251, 140, 0, 0.08)' } }}
                            aria-label="Edit binder"
                            title="Edit binder"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/binders/${binder._id}/share`)}
                            sx={{ color: '#7c3aed', '&:hover': { backgroundColor: 'rgba(124, 58, 237, 0.08)' } }}
                            aria-label="Share binder"
                            title="Share binder"
                          >
                            <ShareIcon />
                          </IconButton>
                          <IconButton 
                            size="medium"
                            onClick={() => navigate(`/binders/${binder._id}/config`)}
                            sx={{ color: '#607D8B', '&:hover': { backgroundColor: 'rgba(96, 125, 139, 0.08)' } }}
                            aria-label="Configure binder"
                            title="Configure binder"
                          >
                            <SettingsIcon />
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
        <DialogTitle>Archive Binders</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive {selectedBinders.size} binder(s)?
          </Typography>
          <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {Array.from(selectedBinders).map(binderId => {
              const binder = items.find(item => item._id === binderId)
              return binder ? (
                <Typography key={binderId} variant="body2" sx={{ py: 0.5 }}>
                  {binder.title}
                </Typography>
              ) : null
            })}
          </Box>
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

      <Dialog open={dearchiveDialogOpen} onClose={() => setDearchiveDialogOpen(false)}>
        <DialogTitle>De-archive Binders</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to de-archive {selectedBinders.size} binder(s)?
          </Typography>
          <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {Array.from(selectedBinders).map(binderId => {
              const binder = items.find(item => item._id === binderId)
              return binder ? (
                <Typography key={binderId} variant="body2" sx={{ py: 0.5 }}>
                  {binder.title}
                </Typography>
              ) : null
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDearchiveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDearchive} 
            variant="contained" 
            color="success"
            disabled={dearchiveMutation.isPending}
          >
            {dearchiveMutation.isPending ? 'Dearchiving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <BinderTransferOwnershipDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onConfirm={handleConfirmTransfer}
        selectedBinders={Array.from(selectedBinders).map(binderId => {
          const binder = items.find(item => item._id === binderId)
          return binder || { _id: binderId, title: 'Unknown' }
        })}
        currentUserId={user?._id}
        isTransferring={transferOwnershipMutation.isPending}
      />

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Box>
  )
}

export default MyBinders