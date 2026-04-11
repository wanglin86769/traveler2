import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useFormSectionNavigation } from '@/hooks/useFormSectionNavigation'
import FormSideNavigation from '@/components/forms/FormSideNavigation'
import DiscrepancyTable from '@/components/forms/DiscrepancyTable'
import { getForm } from '@/services/formService'
import formService from '@/services/formService'
import RichTextViewer from '@/components/common/RichTextViewer'
import FormRenderer from '@/components/forms/FormRenderer'
import { getFormStatusLabel, getFormStatusColor } from '@/utils/status'

import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material'

import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as ReleaseIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon
} from '@mui/icons-material'

function FormDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [selectedDiscrepancyForm, setSelectedDiscrepancyForm] = useState(null)
  const [releaseTitle, setReleaseTitle] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [values, setValues] = useState({})

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id),
    enabled: !!id,
  })

  const currentForm = response

  // Extract all Section elements for sidebar navigation
  const sections = currentForm?.json?.filter(
    (element) => element.type === 'section'
  ) || []

  // Use form section navigation hook
  const {
    activeSection,
    handleSectionRegister,
    scrollToSection
  } = useFormSectionNavigation({
    rootElement: null
  })

  const hasSections = sections.length > 0

  // Fetch released discrepancy forms
  const { data: discrepancyFormsResponse } = useQuery({
    queryKey: ['released-discrepancy-forms'],
    queryFn: () => formService.getReleasedDiscrepancyForms(),
    enabled: releaseDialogOpen && currentForm?.formType === 'normal',
  })
  const discrepancyForms = discrepancyFormsResponse?.data || []

  const archiveMutation = useMutation({
    mutationFn: () => formService.archiveForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', id] })
      setSnackbar({ open: true, message: 'Form archived successfully', severity: 'success' })
      setAnchorEl(null)
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to archive form', severity: 'error' })
    }
  })

  const releaseMutation = useMutation({
    mutationFn: () => formService.releaseForm(id, {
      discrepancyFormId: selectedDiscrepancyForm?._id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', id] })
      setSnackbar({ open: true, message: 'Form released successfully', severity: 'success' })
      setReleaseDialogOpen(false)
      setSelectedDiscrepancyForm(null)
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to release', severity: 'error' })
    }
  })

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleArchive = () => {
    archiveMutation.mutate()
  }

  const handleRelease = () => {
    setReleaseDialogOpen(true)
    setReleaseTitle(currentForm?.title || '')
  }

  const handleConfirmRelease = () => {
    releaseMutation.mutate()
  }

  const handleCancelRelease = () => {
    setReleaseDialogOpen(false)
    setSelectedDiscrepancyForm(null)
    setReleaseTitle('')
  }

  const canEdit = currentForm?.status === 0 && 
    (currentForm?.createdBy === user?._id || currentForm?.owner === user?._id || user?.roles?.includes('admin'))
  
  const canRelease = currentForm?.createdBy === user?._id || 
    currentForm?.owner === user?._id ||
    user?.roles?.includes('admin') || 
    user?.roles?.includes('manager')
  
  const isReleased = currentForm?.status === 1 || currentForm?.status === 2
  
  const canArchive = currentForm?.createdBy === user?._id || 
    currentForm?.owner === user?._id ||
    user?.roles?.includes('admin') || 
    user?.roles?.includes('manager')
  
  const isArchived = currentForm?.archived
  
  const canManageReviewers = currentForm?.status === 0.5 && 
    (currentForm?.createdBy === user?._id || currentForm?.owner === user?._id || 
     user?.roles?.includes('admin') || user?.roles?.includes('manager'))

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Alert severity="error">Error loading form: {error.message}</Alert>
      </Box>
    )
  }

  if (!currentForm) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Form not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Form Area */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflowY: 'auto',
            maxWidth: hasSections ? 'calc(100% - 280px)' : '100%'
          }}
        >
          {/* Header - Action buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2 
          }}>
            <Button 
              startIcon={<BackIcon />} 
              onClick={() => navigate(-1)}
              variant="outlined"
            >
              Back
            </Button>
            <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
              Form Detail
            </Typography>
            <Button
              variant="contained"
              startIcon={<MoreVertIcon />}
              onClick={handleMenuOpen}
            >
              Actions
            </Button>
          </Box>

          {/* Paper with Form Information */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            {/* Form Title */}
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              {currentForm.title || 'Untitled Form'}
            </Typography>
            
            {/* Form Metadata */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3
            }}>
              <Typography variant="body2" color="text.secondary">
                Type:{' '}
                <Box component="span" color="text.primary">
                  {currentForm.formType || 'normal'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status:{' '}
                <Box component="span" color={getFormStatusColor(currentForm.status)} fontWeight={600}>
                  {getFormStatusLabel(currentForm.status)}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version:{' '}
                <Box component="span" color="text.primary">
                  {currentForm._v || 0}
                </Box>
              </Typography>
            </Box>
          </Paper>

          {/* Description */}
          {currentForm.description && (
            <Box sx={{ mb: 3 }}>
              <RichTextViewer content={currentForm.description} />
            </Box>
          )}
          
          {/* Tags */}
          {currentForm.tags && currentForm.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {currentForm.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Form Renderer Paper */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {currentForm.json && currentForm.json.length > 0 ? (
              <FormRenderer
                elements={currentForm.json}
                values={values}
                onChange={(name, value) => setValues(prev => ({ ...prev, [name]: value }))}
                disabled={true}
                mode="preview"
                onSectionRegister={handleSectionRegister}
              />
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No form content
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Side Navigation */}
        {hasSections && sections.length >= 2 && (
          <FormSideNavigation
            sections={sections}
            formTitle={currentForm.title || 'Form Navigation'}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableScrollLock>
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate(`/forms/${id}/edit`) }}
          disabled={!canEdit}
        >
          <EditIcon sx={{ mr: 1 }} /> 
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate(`/forms/${id}/reviewers`) }}
          disabled={!canManageReviewers}
        >
          <PersonIcon sx={{ mr: 1 }} /> 
          Manage Reviewers
        </MenuItem>
        <MenuItem 
          onClick={handleRelease}
          disabled={releaseMutation.isPending || isReleased || currentForm?.status !== 0.5 || !currentForm?.allApproved}
        >
          <ReleaseIcon sx={{ mr: 1 }} /> 
          {releaseMutation.isPending ? 'Releasing...' : (isReleased ? 'Released' : 'Release')}
        </MenuItem>
        {canArchive && (
          <MenuItem 
            onClick={handleArchive}
            disabled={archiveMutation.isPending || isArchived}
          >
            <ArchiveIcon sx={{ mr: 1 }} /> 
            {archiveMutation.isPending ? 'Archiving...' : (isArchived ? 'Archived' : 'Archive')}
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleMenuClose(); setShareDialogOpen(true) }}>
          <ShareIcon sx={{ mr: 1 }} /> Share
        </MenuItem>
      </Menu>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Form</DialogTitle>
        <DialogContent>
          <Typography>Sharing options coming soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={releaseDialogOpen} onClose={handleCancelRelease} maxWidth="lg" fullWidth>
        <DialogTitle>Release Form</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Form Title
            </Typography>
            <TextField
              fullWidth
              value={releaseTitle}
              onChange={(e) => setReleaseTitle(e.target.value)}
              placeholder="Enter form title"
              variant="outlined"
            />
          </Box>

          {currentForm?.formType === 'normal' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Choose a discrepancy to attach
              </Typography>
              <DiscrepancyTable
                forms={discrepancyForms}
                selectedForm={selectedDiscrepancyForm}
                onFormSelect={setSelectedDiscrepancyForm}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRelease}>Cancel</Button>
          <Button 
            onClick={handleConfirmRelease}
            variant="contained"
            disabled={releaseMutation.isPending}
          >
            {releaseMutation.isPending ? 'Releasing...' : 'Confirm Release'}
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

export default FormDetail