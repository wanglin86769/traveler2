import { useState, useEffect } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Checkbox
} from '@mui/material'
import {
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import formService from '@/services/formService'
import travelerService from '@/services/travelerService'

function ReleasedForms() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedForms, setSelectedForms] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true)
          try {
            const data = await formService.getMyReleasedForms()
            setForms(data?.data || [])
          } catch (error) {
            console.error('Failed to fetch released forms:', error)
          } finally {
            setLoading(false)
          }    }
    fetchForms()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await formService.getMyReleasedForms()
      setForms(data?.data || [])
    } catch (error) {
      console.error('Failed to refresh forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectForm = (formId, checked) => {
    if (checked) {
      setSelectedForms([...selectedForms, formId])
    } else {
      setSelectedForms(selectedForms.filter(id => id !== formId))
    }
  }

  const handleSelectAll = (checked) => {
    const currentForms = filteredForms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    if (checked) {
      const newSelected = [...new Set([...selectedForms, ...currentForms.map(f => f._id)])]
      setSelectedForms(newSelected)
    } else {
      setSelectedForms(selectedForms.filter(id => !currentForms.find(f => f._id === id)))
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

  const handleConfirmCreate = async () => {
    try {
      for (const formId of selectedForms) {
        await travelerService.createTraveler({ form: formId })
      }
      setCreateDialogOpen(false)
      setSelectedForms([])
      setSnackbar({ 
        open: true, 
        message: `Successfully created ${selectedForms.length} traveler(s)!`, 
        severity: 'success' 
      })
      await handleRefresh()
    } catch (error) {
      console.error('Failed to create traveler:', error)
      setSnackbar({ 
        open: true, 
        message: 'Failed to create traveler: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      })
    }
  }

  const filteredForms = forms.filter(f => !search || f.title.toLowerCase().includes(search.toLowerCase()))
  const currentForms = filteredForms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const allSelected = currentForms.length > 0 && currentForms.every(f => selectedForms.includes(f._id))

  return (
    <Box sx={{ p: 2 }}>
      {/* First row action buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small">
          Clone
        </Button>
        <Button variant="contained" size="small" sx={{ bgcolor: '#4DB6AC', '&:hover': { bgcolor: '#3D9E92' } }}>
          All public forms
        </Button>
        <Button variant="contained" size="small" sx={{ bgcolor: '#4DB6AC', '&:hover': { bgcolor: '#3D9E92' } }}>
          Reload all tables
        </Button>
      </Box>

      {/* Tab switch */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Box sx={{ 
          bgcolor: '#FFFFFF', 
          px: 2, 
          py: 1, 
          border: '1px solid #E0E0E0',
          borderBottom: 'none',
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1
        }}>
          <Typography variant="body1">Released forms</Typography>
        </Box>
        <Box sx={{ 
          bgcolor: '#F8F9FA', 
          px: 2, 
          py: 1, 
          border: '1px solid #E0E0E0',
          color: '#1976D2',
          cursor: 'pointer'
        }}>
          <Typography variant="body1">Archived released forms</Typography>
        </Box>
      </Box>

      {/* Second row action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ bgcolor: '#4DB6AC', '&:hover': { bgcolor: '#3D9E92' } }}
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Reload table
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ bgcolor: '#0D47A1', '&:hover': { bgcolor: '#0A3578' } }}
            onClick={handleCreateTraveler}
          >
            <i className="fa fa-plane" style={{ marginRight: 8 }}></i>
            Travel
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">10 records per page</Typography>
        </Box>
      </Box>

      {/* Search box */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Search:</Typography>
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 200 }}
          />
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  <TableCell padding="checkbox" sx={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedForms.length > 0 && !allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 40 }}></TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ver</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Released by</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Released</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No released forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentForms.map((form) => (
                    <TableRow key={form._id} hover sx={{ bgcolor: selectedForms.includes(form._id) ? '#E3F2FD' : 'inherit' }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedForms.includes(form._id)}
                          onChange={(e) => handleSelectForm(form._id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <i
                          className="fa fa-eye"
                          style={{ color: '#757575', cursor: 'pointer' }}
                          onClick={() => navigate(`/forms/${form._id}`)}
                        ></i>
                      </TableCell>
                      <TableCell>{form.title}</TableCell>
                      <TableCell>{form.status === 1 ? 'released' : 'draft'}</TableCell>
                      <TableCell>{form.formType || 'normal'}</TableCell>
                      <TableCell>{form.ver || '1'}</TableCell>
                      <TableCell>{form.tags || ''}</TableCell>
                      <TableCell>{form.releasedBy?.name || form.releasedBy || ''}</TableCell>
                      <TableCell>
                        {form.releasedOn ? new Date(form.releasedOn).toLocaleString() : ''}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Bottom status bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredForms.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredForms.length)} of {filteredForms.length} entries
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredForms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton={false}
            showLastButton={false}
            labelDisplayedRows={() => ''}
          />
          <Typography variant="body2" sx={{ color: '#1976D2' }}>
            Release 3.2.0
          </Typography>
        </Box>
      </Box>

      {/* Create Traveler Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create Traveler</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to create traveler(s) from {selectedForms.length} selected form(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCreate} 
            variant="contained"
            color="primary"
          >
            Confirm
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