import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useFormSectionNavigation } from '@/hooks/useFormSectionNavigation'
import FormSideNavigation from '@/components/forms/FormSideNavigation'
import formService from '@/services/formService'
import FormRenderer from '@/components/forms/FormRenderer'

import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material'

import {
  ArrowBack as BackIcon,
  ArchiveOutlined as ArchiveIcon
} from '@mui/icons-material'

function ReleasedFormDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [obsoleteDialogOpen, setObsoleteDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Custom refs for Discrepancy and Base containers
  const discrepancyRef = useRef(null)
  const baseRef = useRef(null)

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['released-form', id],
    queryFn: () => formService.getReleasedForm(id),
    enabled: !!id,
  })

  // Build navigation sections for sidebar
  const sections = useMemo(() => {
    if (!form?.base?.json) return []

    const navSections = []

    // Add Discrepancy section if exists
    if (form.formType === 'normal_discrepancy' && form.discrepancy?.json) {
      navSections.push({
        id: 'discrepancy-section',
        legend: 'Discrepancy'
      })
    }

    // Add Base section
    navSections.push({
      id: 'base-section',
      legend: 'Base'
    })

    // Add sections from base form
    form.base.json
      .filter(element => element.type === 'section')
      .forEach(section => {
        navSections.push(section)
      })

    return navSections
  }, [form])

  // Use form section navigation hook
  const {
    activeSection,
    handleSectionRegister,
    scrollToSection
  } = useFormSectionNavigation({
    rootElement: null
  })

  const hasSections = sections.length > 0

  // Check if user can obsolete (admin or manager)
  const canObsolete = user?.roles?.includes('admin') || user?.roles?.includes('manager')

  // Obsolete mutation
  const obsoleteMutation = useMutation({
    mutationFn: async () => {
      return await formService.archiveReleasedForm(id)
    },
    onSuccess: () => {
      setObsoleteDialogOpen(false)
      setSnackbar({ 
        open: true, 
        message: 'Form has been obsoleted successfully', 
        severity: 'success' 
      })
      // Refresh the current page to show updated status
      queryClient.invalidateQueries({ queryKey: ['released-form', id] })
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: 'Failed to obsolete form: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      })
    }
  })

  const handleObsolete = () => {
    setObsoleteDialogOpen(true)
  }

  const handleConfirmObsolete = () => {
    obsoleteMutation.mutate()
  }

  // Register Discrepancy and Base containers with Intersection Observer
  useEffect(() => {
    if (discrepancyRef.current) {
      handleSectionRegister('discrepancy-section', discrepancyRef.current)
    }
  }, [discrepancyRef.current, handleSectionRegister])

  useEffect(() => {
    if (baseRef.current) {
      handleSectionRegister('base-section', baseRef.current)
    }
  }, [baseRef.current, handleSectionRegister])

  // Override scrollToSection to handle Discrepancy and Base containers
  const handleScrollToSection = (sectionId) => {
    // Check if it's Discrepancy or Base container
    if (sectionId === 'discrepancy-section' && discrepancyRef.current) {
      const element = discrepancyRef.current
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      window.scrollTo({
        top: absoluteElementTop - 80,
        behavior: 'smooth'
      })
      return
    }

    if (sectionId === 'base-section' && baseRef.current) {
      const element = baseRef.current
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      window.scrollTo({
        top: absoluteElementTop - 80,
        behavior: 'smooth'
      })
      return
    }

    // For regular sections, use the original scrollToSection
    scrollToSection(sectionId)
  }

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Render error state
  if (error || !form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load released form. {error?.message || 'Form not found'}
        </Alert>
      </Box>
    )
  }

  // Render main content
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
              Released Form Detail
            </Typography>
            {form.status === 1 && canObsolete && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<ArchiveIcon />}
                onClick={handleObsolete}
                sx={{ 
                  bgcolor: '#FF9800', 
                  '&:hover': { bgcolor: '#FB8C00' } 
                }}
              >
                Obsolete
              </Button>
            )}
          </Box>

          {/* Paper with Form Information */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            {/* Form Title */}
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              {form.title}
            </Typography>
            
            {/* Form Metadata */}
            <Box sx={{
              display: 'flex',
              gap: 3
            }}>
              <Typography variant="body2" color="text.secondary">
                Type:{' '}
                <Box component="span" color="text.primary">
                  {form.formType}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status:{' '}
                <Box component="span" color="text.primary">
                  {form.status === 1 ? 'released' : 'archived'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version:{' '}
                <Box component="span" color="text.primary">
                  {form.ver}
                </Box>
              </Typography>
            </Box>
          </Paper>

          {/* Description */}
          {form.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {form.description}
            </Typography>
          )}
          
          {/* Discrepancy Form Preview (if applicable) - displayed at the top */}
          {form.formType === 'normal_discrepancy' && form.discrepancy?.json && (
            <Box id="discrepancy-section" ref={discrepancyRef}>
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#212529', fontWeight: 600 }}>
                  Discrepancy
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormRenderer
                  elements={form.discrepancy.json}
                  values={{}}
                  disabled={true}
                />
              </Paper>
            </Box>
          )}

          {/* Base Form Preview - displayed at the bottom */}
          <Box id="base-section" ref={baseRef}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#212529', fontWeight: 600 }}>
                Base
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {form.base?.json ? (
                <FormRenderer
                  elements={form.base.json}
                  values={{}}
                  disabled={true}
                  onSectionRegister={handleSectionRegister}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No form content
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Side Navigation */}
        {hasSections && sections.length >= 2 && (
          <FormSideNavigation
            sections={sections}
            formTitle={form.title || 'Released Form Navigation'}
            activeSection={activeSection}
            onSectionClick={handleScrollToSection}
          />
        )}
      </Box>

      {/* Obsolete Confirmation Dialog */}
      <Dialog open={obsoleteDialogOpen} onClose={() => setObsoleteDialogOpen(false)}>
        <DialogTitle>Obsolete Released Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to obsolete this released form? This will move it to the archived tab and it will no longer be available for creating new travelers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setObsoleteDialogOpen(false)}
            disabled={obsoleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmObsolete} 
            variant="contained"
            color="warning"
            disabled={obsoleteMutation.isPending}
            sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#FB8C00' } }}
          >
            {obsoleteMutation.isPending ? 'Obsoleting...' : 'Confirm'}
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

export default ReleasedFormDetail