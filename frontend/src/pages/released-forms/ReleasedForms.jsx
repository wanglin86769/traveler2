import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ContentCopy as CloneIcon,
  ArchiveOutlined as ArchiveIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import formService from '@/services/formService'
import travelerService from '@/services/travelerService'

function ReleasedForms() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [selectedForms, setSelectedForms] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isReloading, setIsReloading] = useState(false)

  const tabs = [
    { label: 'Released forms', status: 'released' },
    { label: 'Archived released forms', status: 'archived' }
  ]

  // Get released forms
  const { data: releasedData, isLoading: releasedLoading } = useQuery({
    queryKey: ['released-forms', { page: page + 1, limit: rowsPerPage }],
    queryFn: () => formService.getReleasedForms({ page: page + 1, limit: rowsPerPage }),
    enabled: currentTab === 0
  })

  // Get archived released forms
  const { data: archivedData, isLoading: archivedLoading } = useQuery({
    queryKey: ['archived-released-forms', { page: page + 1, limit: rowsPerPage }],
    queryFn: () => formService.getArchivedReleasedForms({ page: page + 1, limit: rowsPerPage }),
    enabled: currentTab === 1
  })

  const items = currentTab === 0 ? (releasedData?.data || []) : (archivedData?.data || [])
  const pagination = currentTab === 0 ? (releasedData?.pagination || { total: 0 }) : (archivedData?.pagination || { total: 0 })
  const isLoading = currentTab === 0 ? releasedLoading : archivedLoading

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    setPage(0)
    setSelectedForms([])
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRefresh = async () => {
    setIsReloading(true)
    await queryClient.invalidateQueries({ queryKey: ['released-forms'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-released-forms'] })
    setTimeout(() => setIsReloading(false), 500)
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
      setSelectedForms(items.map(f => f._id))
    } else {
      setSelectedForms([])
    }
  }

  const handleCreateTraveler = () => {
    if (selectedForms.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'Please select at least one form to create traveler', 
        severity: 'warning' 
      })
      return
    }
    setCreateDialogOpen(true)
  }

  const handleCloneForms = () => {
    if (selectedForms.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'Please select at least one form to clone', 
        severity: 'warning' 
      })
      return
    }
    setCloneDialogOpen(true)
  }

  const createTravelerMutation = useMutation({
    mutationFn: async () => {
      for (const formId of selectedForms) {
        await travelerService.createTraveler({ form: formId })
      }
    },
    onSuccess: () => {
      setCreateDialogOpen(false)
      setSelectedForms([])
      setSnackbar({ 
        open: true, 
        message: `Successfully created ${selectedForms.length} traveler(s)!`, 
        severity: 'success' 
      })
      handleRefresh()
      // Invalidate travelers query cache to display latest data on other pages
      queryClient.invalidateQueries({ queryKey: ['travelers'] })
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: 'Failed to create traveler: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      })
    }
  })

  const cloneFormsMutation = useMutation({
    mutationFn: async () => {
      for (const formId of selectedForms) {
        await formService.cloneForm(formId, `${items.find(f => f._id === formId)?.title} clone`)
      }
    },
    onSuccess: () => {
      setCloneDialogOpen(false)
      setSelectedForms([])
      setSnackbar({ 
        open: true, 
        message: `Successfully cloned ${selectedForms.length} form(s)!`, 
        severity: 'success' 
      })
      handleRefresh()
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: 'Failed to clone form(s): ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      })
    }
  })

  const allSelected = items.length > 0 && selectedForms.length === items.length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Released Forms
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloneIcon />}
            onClick={handleCloneForms}
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
              onClick={handleRefresh}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
              onClick={handleCreateTraveler}
              disabled={selectedForms.length === 0}
            >
              <i className="fa fa-plane" style={{ marginRight: 8 }}></i>
              Travel
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
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
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

          {/* Table */}
          <TableContainer>
            <Table sx={{ border: '1px solid #E0E0E0' }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0', width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedForms.length > 0 && !allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Ver</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Tags</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Released by</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Released</TableCell>
                  <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ border: '1px solid #E0E0E0' }}>Loading...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ border: '1px solid #E0E0E0' }}>
                      No {currentTab === 0 ? 'released' : 'archived'} forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  items
                    .filter(f => !search || f.title.toLowerCase().includes(search.toLowerCase()))
                    .map((form) => (
                    <TableRow key={form._id} hover sx={{ bgcolor: selectedForms.includes(form._id) ? '#E3F2FD' : 'inherit' }}>
                      <TableCell padding="checkbox" sx={{ border: '1px solid #E0E0E0' }}>
                        <Checkbox
                          checked={selectedForms.includes(form._id)}
                          onChange={(e) => handleSelectForm(form._id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography fontWeight={500}>{form.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Chip
                          label={currentTab === 0 ? 'released' : 'archived'}
                          color={currentTab === 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">{form.formType || 'normal'}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">{form.ver || '1'}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">{form.tags || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">{form.releasedBy?.name || form.releasedBy || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <Typography variant="body2">
                          {form.releasedOn ? new Date(form.releasedOn).toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/released-forms/${form._id}`)}
                          sx={{ color: '#757575' }}
                        >
                          <ViewIcon />
                        </IconButton>
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

      {/* Create Traveler Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create Traveler</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to create traveler(s) from {selectedForms.length} selected form(s)?
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.50', 
            border: 1, 
            borderColor: 'grey.200',
            borderRadius: 1,
            maxHeight: 200,
            overflow: 'auto'
          }}>
            <List dense>
              {items.filter(item => selectedForms.includes(item._id)).map((item) => (
                <ListItem key={item._id}>
                  <ListItemText 
                    primary={<><span style={{ fontSize: '18px', fontWeight: 'bold' }}>·</span> {item.title}</>}
                    primaryTypographyProps={{ 
                      sx: { fontFamily: 'monospace' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createTravelerMutation.mutate()}
            variant="contained"
            color="primary"
            disabled={createTravelerMutation.isPending}
          >
            {createTravelerMutation.isPending ? 'Creating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Forms Dialog */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)}>
        <DialogTitle>Clone Forms</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to clone {selectedForms.length} selected form(s)?
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.50', 
            border: 1, 
            borderColor: 'grey.200',
            borderRadius: 1,
            maxHeight: 200,
            overflow: 'auto'
          }}>
            <List dense>
              {items.filter(item => selectedForms.includes(item._id)).map((item) => (
                <ListItem key={item._id}>
                  <ListItemText 
                    primary={<><span style={{ fontSize: '18px', fontWeight: 'bold' }}>·</span> {item.title}</>}
                    primaryTypographyProps={{ 
                      sx: { fontFamily: 'monospace' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => cloneFormsMutation.mutate()}
            variant="contained"
            color="primary"
            disabled={cloneFormsMutation.isPending}
          >
            {cloneFormsMutation.isPending ? 'Cloning...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ReleasedForms