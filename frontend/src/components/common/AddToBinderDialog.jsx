import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import { Folder as FolderIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import { getBinders } from '@/services/binderService'
import { addWorksToBinder } from '@/services/binderService'

function AddToBinderDialog({ open, onClose, itemIds, itemType = 'traveler', sourceItem }) {
  const [binders, setBinders] = useState([])
  const [selectedBinders, setSelectedBinders] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Get writable binders list
  useEffect(() => {
    if (open && !dataLoaded && !success) {
      setLoading(true)
      setError(null)
      getBinders({ limit: 100 })
        .then(response => {
          // Filter binders with status 0 or 1 (binders that can accept works)
          const writableBinders = response.data.filter(
            b => b.status === 0 || b.status === 1
          )
          setBinders(writableBinders)
          setLoading(false)
          setDataLoaded(true)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
          setDataLoaded(true)
        })
    }
  }, [open, dataLoaded, success])

  const handleToggleBinder = (binderId, event) => {
    if (event) {
      event.stopPropagation()
    }
    const newSelected = new Set(selectedBinders)
    if (newSelected.has(binderId)) {
      newSelected.delete(binderId)
    } else {
      newSelected.add(binderId)
    }
    setSelectedBinders(newSelected)
  }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = binders.map(b => b._id)
      setSelectedBinders(new Set(allIds))
    } else {
      setSelectedBinders(new Set())
    }
  }

  const handleConfirm = async () => {
    if (selectedBinders.size === 0) {
      setError('Please select at least one binder')
      return
    }

    setAdding(true)
    setError(null)

    try {
      // Add items to each selected binder
      const promises = Array.from(selectedBinders).map(binderId =>
        addWorksToBinder(binderId, {
          ids: itemIds,
          type: itemType
        })
      )

      await Promise.all(promises)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to add items to binder')
      setAdding(false)
    }
  }

  const handleClose = () => {
    setSelectedBinders(new Set())
    setSuccess(false)
    setError(null)
    setDataLoaded(false)
    onClose()
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '—'
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

  const isAllSelected = binders.length > 0 && selectedBinders.size === binders.length
  const isSomeSelected = selectedBinders.size > 0 && selectedBinders.size < binders.length

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add the {itemIds.length} {itemType}{itemIds.length > 1 ? '(s)' : ''}
      </DialogTitle>
      <DialogContent>
        {sourceItem && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {sourceItem.title}, created {formatTimeAgo(sourceItem.createdOn)}, updated {formatTimeAgo(sourceItem.updatedOn)}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          into following binders
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully added {itemIds.length} {itemType}{itemIds.length > 1 ? 's' : ''} to {selectedBinders.size} binder{selectedBinders.size > 1 ? 's' : ''}!
          </Alert>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : binders.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No writable binders found. You can only add items to binders with status "New" or "Active".
          </Alert>
        ) : (
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
                  <TableCell />
                  <TableCell>Title</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {binders.map((binder) => (
                  <TableRow
                    key={binder._id}
                    hover
                    selected={selectedBinders.has(binder._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBinders.has(binder._id)}
                        onChange={(e) => handleToggleBinder(binder._id, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <VisibilityIcon color="primary" fontSize="small" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{binder.title}</Typography>
                    </TableCell>
                    <TableCell>
                      {binder.tags && binder.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {binder.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimeAgo(binder.createdOn)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimeAgo(binder.updatedOn)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Typography variant="caption" sx={{ mr: 'auto', ml: 2 }}>
          Showing {binders.length} of {binders.length} entries
        </Typography>
        {!success ? (
          <Button onClick={handleClose} disabled={adding}>
            Return
          </Button>
        ) : null}
        {!success ? (
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={adding || selectedBinders.size === 0 || binders.length === 0}
          >
            Confirm
          </Button>
        ) : null}
        {success && (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AddToBinderDialog