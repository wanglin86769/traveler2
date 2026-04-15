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
  Chip,
  IconButton,
  TablePagination
} from '@mui/material'
import {
  Folder as FolderIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { getWritableBinders, addWorksToBinder } from '@/services/binderService'

function AddToBinderDialog({ open, onClose, itemIds, itemType = 'traveler', sourceItem }) {
  const [binders, setBinders] = useState([])
  const [selectedBinders, setSelectedBinders] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [results, setResults] = useState({}) // Store individual binder results
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Get writable binders list
  useEffect(() => {
    if (open && !dataLoaded && !success) {
      setLoading(true)
      setError(null)
      getWritableBinders({ limit: 100 })
        .then(response => {
          setBinders(response)
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
      // Only select binders on current page
      const currentPageIds = paginatedBinders.map(b => b._id)
      const newSelected = new Set(selectedBinders)
      currentPageIds.forEach(id => newSelected.add(id))
      setSelectedBinders(newSelected)
    } else {
      // Deselect binders on current page
      const currentPageIds = paginatedBinders.map(b => b._id)
      const newSelected = new Set(selectedBinders)
      currentPageIds.forEach(id => newSelected.delete(id))
      setSelectedBinders(newSelected)
    }
  }

  const handleConfirm = async () => {
    if (selectedBinders.size === 0) {
      setError('Please select at least one binder')
      return
    }

    setAdding(true)
    setError(null)
    setResults({})

    try {
      // Show individual status for each binder
      const promises = Array.from(selectedBinders).map(binderId =>
        addWorksToBinder(binderId, {
          ids: itemIds,
          type: itemType
        })
        .then(result => ({ binderId, success: true, data: result }))
        .catch(err => ({ binderId, success: false, error: err.message }))
      )

      const resultsList = await Promise.all(promises)
      
      // Convert to object for easy access
      const resultsMap = {}
      resultsList.forEach(result => {
        resultsMap[result.binderId] = result
      })
      
      setResults(resultsMap)
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
    setResults({})
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

  const isAllSelected = binders && binders.length > 0 && selectedBinders.size === binders.length
  const isSomeSelected = binders && selectedBinders.size > 0 && selectedBinders.size < binders.length

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedBinders = binders ? binders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []
  const startIndex = page * rowsPerPage + 1
  const endIndex = Math.min((page + 1) * rowsPerPage, binders?.length || 0)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add the {itemIds.length} {itemType}{itemIds.length > 1 ? '(s)' : ''}
      </DialogTitle>
      <DialogContent>
        {sourceItem && itemIds.length === 1 ? (
          <Typography variant="body2" sx={{ mb: 2, color: 'primary.main' }}>
            <span style={{ fontWeight: 'bold' }}>{sourceItem.title}</span>, created {formatTimeAgo(sourceItem.createdOn)}{sourceItem.updatedOn ? `, updated ${formatTimeAgo(sourceItem.updatedOn)}` : ''}
          </Typography>
        ) : itemIds.length > 1 && sourceItem ? (
          <Box sx={{ mb: 2 }}>
            {Array.from(itemIds).map((id, index) => {
              const item = Array.isArray(sourceItem) ? sourceItem[index] : sourceItem
              return (
                <Typography key={id} variant="body2" sx={{ color: 'primary.main', mb: 0.5 }}>
                  <span style={{ fontWeight: 'bold' }}>{item.title}</span>, created {formatTimeAgo(item.createdOn)}{item.updatedOn ? `, updated ${formatTimeAgo(item.updatedOn)}` : ''}
                </Typography>
              )
            })}
          </Box>
        ) : null}

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
        ) : error && !results ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : !binders || binders.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No writable binders found. You can only add items to binders with status "New" or "Active".
          </Alert>
        ) : (
          <>
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
                  <TableCell>Tags</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBinders && paginatedBinders.map((binder) => {
                  const result = results[binder._id]
                  return (
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
                          disabled={adding}
                        />
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
                      <TableCell>
                        {adding && !result && (
                          <CircularProgress size={20} />
                        )}
                        {result?.success && (
                          <CheckCircleIcon color="success" />
                        )}
                        {result?.success === false && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ErrorIcon color="error" />
                            <Typography variant="caption" color="error">
                              {result.error}
                            </Typography>
                          </Box>
                        )}
                        {!adding && !result && (
                          <Chip
                            label={binder.status === 0 ? 'New' : binder.status === 1 ? 'Active' : 'Completed'}
                            size="small"
                            color={binder.status === 0 ? 'default' : binder.status === 1 ? 'primary' : 'success'}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/binders/${binder._id}`, '_blank')
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" sx={{ ml: 2 }}>
              Showing {startIndex} to {endIndex} of {binders.length} entries
            </Typography>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={binders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!success ? (
          <Button onClick={handleClose} disabled={adding}>
            Cancel
          </Button>
        ) : null}
        {!success ? (
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={adding || selectedBinders.size === 0 || !binders || binders.length === 0}
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