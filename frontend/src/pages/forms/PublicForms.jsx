import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '@mui/material/Avatar'
import { getPublicForms, cloneForm } from '@/services/formService'
import { getFormStatusLabel, getFormStatusColor } from '@/utils/status'
import { useAuth } from '@/contexts/AuthContext'
import CloneDialog from '@/components/forms/CloneDialog'

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
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Checkbox
} from '@mui/material'

import {
  MoreVert as MoreIcon,
  ContentCopy as CloneIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

// Format relative time
const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

function PublicForms() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedForm, setSelectedForm] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [currentTab, setCurrentTab] = useState(0)
  const [isReloading, setIsReloading] = useState(false)
  const [selectedForms, setSelectedForms] = useState([])
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)

  // Tab definitions
  const tabs = [
    { label: 'Draft Forms', status: 0 },
    { label: 'Released Forms', status: 1 }
  ]

  // Fetch public forms list using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['publicForms', { page: page + 1, limit: rowsPerPage, search, tab: currentTab }],
    queryFn: () => getPublicForms({ page: page + 1, limit: rowsPerPage, search, status: tabs[currentTab].status }),
    keepPreviousData: true,
  })

  const items = data?.data || []
  const pagination = data?.pagination || { total: 0 }

  // Clone form mutation
  const cloneMutation = useMutation({
    mutationFn: async (titles) => {
      const clonePromises = selectedForms.map((formId) => {
        const form = items.find(item => item._id === formId)
        const title = titles[formId] || `${form?.title} clone`
        return cloneForm(formId, title)
      })
      return Promise.all(clonePromises)
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Forms cloned successfully', severity: 'success' })
      setSelectedForms([])
      setCloneDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['publicForms'] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to clone forms', severity: 'error' })
    }
  })

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    setPage(0)
    setSearch('')
  }

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget)
    setSelectedForm(form)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedForm(null)
  }

  const handleView = () => {
    navigate(`/forms/${selectedForm._id}`)
    handleMenuClose()
  }

  const handleSelectForm = (formId, checked) => {
    if (checked) {
      setSelectedForms([...selectedForms, formId])
    } else {
      setSelectedForms(selectedForms.filter(id => id !== formId))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedForms(items.map(form => form._id))
    } else {
      setSelectedForms([])
    }
  }

  const handleClone = () => {
    if (selectedForms.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one form', severity: 'warning' })
      return
    }
    setCloneDialogOpen(true)
  }

  const handleConfirmClone = (titles) => {
    cloneMutation.mutate(titles)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Public Forms
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloneIcon />}
            onClick={handleClone}
            disabled={selectedForms.length === 0}
          >
            Clone
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} sx={{ textTransform: 'none' }} />
            ))}
          </Tabs>

          {/* Action button group */}
          <Box sx={{ display: 'flex', gap: 1, mt: 3, mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={isReloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RefreshIcon />}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
              onClick={async () => {
                setIsReloading(true)
                await queryClient.invalidateQueries({ queryKey: ['publicForms'] })
                setTimeout(() => setIsReloading(false), 500)
              }}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
          </Box>

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
                  {currentTab === 0 ? (
                    <>
                      <TableCell sx={{ width: 60, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        <Checkbox
                          checked={items.length > 0 && selectedForms.length === items.length}
                          indeterminate={selectedForms.length > 0 && selectedForms.length < items.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Tags</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Created By</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Created</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Owner</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Shared With</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Shared Groups</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ width: 60, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        <Checkbox
                          checked={items.length > 0 && selectedForms.length === items.length}
                          indeterminate={selectedForms.length > 0 && selectedForms.length < items.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Ver</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Tags</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Released By</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Released</TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ border: '1px solid #E0E0E0' }}>Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={currentTab === 0 ? 10 : 9} align="center" color="error" sx={{ border: '1px solid #E0E0E0' }}>
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={currentTab === 0 ? 10 : 9} align="center" sx={{ border: '1px solid #E0E0E0' }}>No forms found</TableCell>
                  </TableRow>
                ) : (
                  items.map((form) => (
                    <TableRow key={form._id} hover sx={{ backgroundColor: selectedForms.includes(form._id) ? '#E3F2FD' : 'inherit' }}>
                      {currentTab === 0 ? (
                        <>
                          <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                            <Checkbox
                              checked={selectedForms.includes(form._id)}
                              onChange={(e) => handleSelectForm(form._id, e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography fontWeight={500}>{form.title}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Chip
                              label={getFormStatusLabel(form.status)}
                              size="small"
                              color={getFormStatusColor(form.status)}
                            />
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {form.tags?.map((tag) => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {form.createdBy?.name?.charAt(0) || '?'}
                              </Avatar>
                              <Typography variant="body2">
                                {form.createdBy?.name || '-'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography variant="body2">
                              {formatRelativeTime(form.updatedOn)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {form.owner?.name?.charAt(0) || '?'}
                              </Avatar>
                              <Typography variant="body2">
                                {form.owner?.name || '-'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {form.sharedWith?.slice(0, 2).map((share) => (
                                <Chip key={share._id} label={share.username} size="small" variant="outlined" />
                              ))}
                              {form.sharedWith?.length > 2 && (
                                <Chip label={`+${form.sharedWith.length - 2}`} size="small" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {form.sharedGroup?.slice(0, 2).map((share) => (
                                <Chip key={share._id} label={share.groupname} size="small" variant="outlined" />
                              ))}
                              {form.sharedGroup?.length > 2 && (
                                <Chip label={`+${form.sharedGroup.length - 2}`} size="small" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                size="medium" 
                                onClick={() => navigate(`/forms/${form._id}`)}
                                sx={{ color: '#2196F3', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.08)' } }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton 
                                size="medium"
                                onClick={() => {
                                  setSelectedForms([form._id])
                                  handleClone()
                                }}
                                sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' } }}
                              >
                                <CloneIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                            <Checkbox
                              checked={selectedForms.includes(form._id)}
                              onChange={(e) => handleSelectForm(form._id, e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography fontWeight={500}>{form.title}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Chip
                              label={getFormStatusLabel(form.status)}
                              size="small"
                              color={getFormStatusColor(form.status)}
                            />
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography variant="body2">{form.formType || 'normal'}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography variant="body2">{form.version || '1'}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {form.tags?.map((tag) => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {form.updatedBy?.charAt(0) || '?'}
                              </Avatar>
                              <Typography variant="body2">
                                {form.updatedBy || '-'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                            <Typography variant="body2">
                              {form.updatedOn ? new Date(form.updatedOn).toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              }) : ''}
                            </Typography>
                          </TableCell>
                          <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                size="medium" 
                                onClick={() => navigate(`/forms/${form._id}`)}
                                sx={{ color: '#2196F3', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.08)' } }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton 
                                size="medium"
                                onClick={() => {
                                  setSelectedForms([form._id])
                                  handleClone()
                                }}
                                sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' } }}
                              >
                                <CloneIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </>
                      )}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} /> View
        </MenuItem>
      </Menu>

      <CloneDialog
        open={cloneDialogOpen}
        onClose={() => setCloneDialogOpen(false)}
        onConfirm={handleConfirmClone}
        selectedForms={selectedForms.map(id => items.find(f => f._id === id)).filter(Boolean)}
        isCloning={cloneMutation.isPending}
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

export default PublicForms