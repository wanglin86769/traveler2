import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment,
  Folder,
  Assignment as TravelerIcon,
  Folder as BinderIcon
} from '@mui/icons-material'
import { getBinder, getBinders, addWorksToBinder, removeWorkFromBinder, getBinderWorks } from '@/services/binderService'
import { getTravelers } from '@/services/travelerService'

function BinderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [addWorkDialogOpen, setAddWorkDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('traveler')
  const [selectedIds, setSelectedIds] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Use React Query to get binder details
  const { data: currentBinder, isLoading, error: binderError } = useQuery({
    queryKey: ['binder', id],
    queryFn: () => getBinder(id),
    enabled: !!id,
  })

  // Use React Query to get works details
  const { data: worksData, isLoading: worksLoading } = useQuery({
    queryKey: ['binder-works', id],
    queryFn: () => getBinderWorks(id),
    enabled: !!id && !!currentBinder,
  })

  const works = worksData?.works || []
  const progressData = worksData || {}

  // Get travelers list
  const { data: travelersData } = useQuery({
    queryKey: ['travelers', { limit: 100 }],
    queryFn: () => getTravelers({ limit: 100 }),
  })

  const travelers = travelersData?.data || []

  // Get binders list
  const { data: bindersData } = useQuery({
    queryKey: ['binders', { limit: 100 }],
    queryFn: () => getBinders({ limit: 100 }),
  })

  const binders = bindersData?.data || []

  // Helper functions
  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return 'New'
      case 1: return 'Active'
      case 2: return 'Completed'
      case 3: return 'Archived'
      default: return 'Unknown'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'default'
      case 1: return 'primary'
      case 2: return 'success'
      case 3: return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <Assignment />
      case 1: return <Assignment />
      case 2: return <Assignment />
      case 3: return <Assignment />
      default: return <Assignment />
    }
  }

  const getWorkProgress = (work) => {
    if (work.finished >= 100) return 100
    return Math.round((work.finished + work.inProgress) / 2)
  }

  const getWorkStatusColor = (color) => {
    switch (color) {
      case 'green': return 'success'
      case 'yellow': return 'warning'
      case 'red': return 'error'
      case 'blue': return 'primary'
      case 'black': return 'default'
      default: return 'default'
    }
  }

  // Mutation to add work
  const addWorkMutation = useMutation({
    mutationFn: (ids) => addWorksToBinder(id, { ids, type: selectedType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binder', id] })
      queryClient.invalidateQueries({ queryKey: ['binder-works', id] })
      setSnackbar({ open: true, message: 'Works added', severity: 'success' })
      setAddWorkDialogOpen(false)
      setSelectedIds([])
      setSelectedType('traveler')
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add works', severity: 'error' })
    }
  })

  // Mutation to remove work
  const removeWorkMutation = useMutation({
    mutationFn: (workId) => removeWorkFromBinder(id, workId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binder', id] })
      queryClient.invalidateQueries({ queryKey: ['binder-works', id] })
      setSnackbar({ open: true, message: 'Work removed', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to remove work', severity: 'error' })
    }
  })

  const handleAddWork = () => {
    if (selectedIds.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one item', severity: 'error' })
      return
    }

    addWorkMutation.mutate(selectedIds)
  }

  const handleToggleSelection = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = () => {
    const availableItems = selectedType === 'traveler' ? travelers : binders
    const allIds = availableItems.map(item => item._id)
    setSelectedIds(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedIds([])
  }

  const handleRemoveWork = (workId) => {
    if (window.confirm('Are you sure you want to remove this work?')) {
      removeWorkMutation.mutate(workId)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (binderError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Alert severity="error">Error loading binder: {binderError.message}</Alert>
      </Box>
    )
  }

  if (!currentBinder) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Binder not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Title and action buttons area */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/binders')} size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
          {currentBinder.title}
        </Typography>
        <Button variant="outlined" size="small">Details</Button>
        <Button variant="outlined" size="small">Default sorting</Button>
        <Button variant="outlined" size="small">Select all</Button>
        <Button variant="outlined" size="small">Select none</Button>
        <Button variant="contained" size="small" color="primary">Generate report</Button>
        <Button variant="contained" size="small" color="primary">Configuration</Button>
      </Box>

      {/* Subtitle */}
      {currentBinder.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {currentBinder.description}
        </Typography>
      )}

      {/* Progress area */}
      <Box sx={{ mb: 4 }}>
        {/* Work progress */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Work :: total: {currentBinder.totalWork || 0}; finished: {currentBinder.finishedWork || 0}; in-progress: {currentBinder.inProgressWork || 0};
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1, height: 20, backgroundColor: '#e0e0e0', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  backgroundColor: '#27ae60',
                  width: `${(currentBinder.finishedWork / currentBinder.totalWork) * 100 || 0}%`
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(currentBinder.finishedWork / currentBinder.totalWork) * 100 || 0}%`,
                  top: 0,
                  height: '100%',
                  backgroundColor: '#3498db',
                  width: `${(currentBinder.inProgressWork / currentBinder.totalWork) * 100 || 0}%`
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
              {currentBinder.finishedWork || 0} + {currentBinder.inProgressWork || 0} / {currentBinder.totalWork || 0}
            </Typography>
          </Box>
        </Box>

        {/* Input progress */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Input :: total: {currentBinder.totalInput || 0}; finished: {currentBinder.finishedInput || 0};
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1, height: 20, backgroundColor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: '#27ae60',
                  width: `${(currentBinder.finishedInput / currentBinder.totalInput) * 100 || 0}%`
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
              {currentBinder.finishedInput || 0} / {currentBinder.totalInput || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Works table */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Works</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Search:</Typography>
            <TextField
              size="small"
              placeholder="Search works..."
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddWorkDialogOpen(true)}
              disabled={currentBinder.status === 2 || currentBinder.status === 3}
            >
              Add Works
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>S</TableCell>
                <TableCell width={50}>C</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Devices</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Reporting IDs</TableCell>
                <TableCell>Powered by</TableCell>
                <TableCell>Estimated progress</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worksLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="text.secondary">No works added yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work._id} hover>
                    <TableCell>
                      <Typography variant="caption">{work.sequence || 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={work.refType} 
                        size="small" 
                        sx={{
                          backgroundColor: work.refType === 'traveler' ? '#E3F2FD' : '#F3E5F5',
                          color: work.refType === 'traveler' ? '#1976D2' : '#7B1FA2'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            '& .work-title': {
                              color: 'primary.main',
                              textDecoration: 'underline'
                            }
                          }
                        }}
                        onClick={() => {
                          if (work.refType === 'traveler') {
                            navigate(`/travelers/${work._id}`)
                          } else if (work.refType === 'binder') {
                            navigate(`/binders/${work._id}`)
                          }
                        }}
                      >
                        {work.refType === 'traveler' ? (
                          <TravelerIcon fontSize="small" color="primary" />
                        ) : (
                          <BinderIcon fontSize="small" color="primary" />
                        )}
                        <Typography 
                          fontWeight={500} 
                          className="work-title"
                          sx={{ color: 'inherit' }}
                        >
                          {work.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{currentBinder.owner || currentBinder.createdBy}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>W</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 1, overflow: 'hidden', width: 60 }}>
                          <Box
                            sx={{
                              height: '100%',
                              backgroundColor: getWorkProgress(work) >= 100 ? '#27ae60' : '#3498db',
                              width: `${getWorkProgress(work)}%`
                            }}
                          />
                        </Box>
                        <Typography variant="caption">{getWorkProgress(work)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        onClick={() => handleRemoveWork(work._id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">
            Showing 1 to {works.length} of {works.length} entries
          </Typography>
          <Typography variant="caption">Release 3.2.0</Typography>
        </Box>
      </Paper>

      {/* Add Works dialog */}
      <Dialog open={addWorkDialogOpen} onClose={() => setAddWorkDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add Works to Binder</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setSelectedIds([])
              }}
              label="Type"
            >
              <MenuItem value="traveler">Traveler</MenuItem>
              <MenuItem value="binder">Binder</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="outlined" size="small" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outlined" size="small" onClick={handleDeselectAll}>
              Deselect All
            </Button>
            <Typography variant="body2" sx={{ ml: 'auto', alignSelf: 'center' }}>
              Selected: {selectedIds.length}
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width={50}>
                    <Checkbox
                      indeterminate={selectedIds.length > 0 && selectedIds.length < (selectedType === 'traveler' ? travelers.length : binders.length)}
                      checked={selectedIds.length > 0 && selectedIds.length === (selectedType === 'traveler' ? travelers.length : binders.length)}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Owner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedType === 'traveler' && travelers.map((traveler) => (
                  <TableRow key={traveler._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(traveler._id)}
                        onChange={() => handleToggleSelection(traveler._id)}
                      />
                    </TableCell>
                    <TableCell>{traveler.title}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(traveler.status)} size="small" color={getStatusColor(traveler.status)} />
                    </TableCell>
                    <TableCell>{traveler.createdBy || traveler.owner || '—'}</TableCell>
                  </TableRow>
                ))}
                {selectedType === 'binder' && binders.map((binder) => (
                  <TableRow key={binder._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(binder._id)}
                        onChange={() => handleToggleSelection(binder._id)}
                      />
                    </TableCell>
                    <TableCell>{binder.title}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(binder.status)} size="small" color={getStatusColor(binder.status)} />
                    </TableCell>
                    <TableCell>{binder.createdBy || binder.owner || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWorkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddWork}
            variant="contained"
            disabled={addWorkMutation.isPending || selectedIds.length === 0}
          >
            {addWorkMutation.isPending ? 'Adding...' : `Add ${selectedIds.length} Works`}
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

export default BinderDetail