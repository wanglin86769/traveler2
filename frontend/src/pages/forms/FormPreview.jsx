import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormSectionNavigation } from '@/hooks/useFormSectionNavigation'
import FormSideNavigation from '@/components/forms/FormSideNavigation'
import { getFormStatusLabel, getFormStatusColor } from '@/utils/status'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  Snackbar,
  Divider
} from '@mui/material'

import { getForm } from '@/services/formService'
import FormRenderer from '@/components/forms/FormRenderer'
import {
  ArrowBack as BackIcon,
  Code as CodeIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material'

function FormPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [values, setValues] = useState({})
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Fetch form data
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id),
  })

  // Extract all Section elements for sidebar navigation
  const sections = form?.json?.filter(
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

  const formData = form || {}
  const elements = formData.json || []
  const hasSections = sections.length > 0

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
              Form Preview
            </Typography>
            <Tooltip title="View JSON">
              <Button
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={() => setJsonDialogOpen(true)}
              >
                View JSON
              </Button>
            </Tooltip>
          </Box>

          {/* Paper with Form Information */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            {/* Form Title */}
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              {formData.title || 'Untitled Form'}
            </Typography>
            
            {/* Form Metadata */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3
            }}>
              <Typography variant="body2" color="text.secondary">
                Type:{' '}
                <Box component="span" color="text.primary">
                  {formData.formType || 'normal'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status:{' '}
                <Box component="span" color={getFormStatusColor(formData.status)} fontWeight={600}>
                  {getFormStatusLabel(formData.status)}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version:{' '}
                <Box component="span" color="text.primary">
                  {formData._v || 0}
                </Box>
              </Typography>
            </Box>
          </Paper>

          {/* Description */}
          {formData.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {formData.description}
            </Typography>
          )}
          
          {/* Form Renderer Paper */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <FormRenderer
              elements={elements}
              values={values}
              onChange={(name, value) => setValues(prev => ({ ...prev, [name]: value }))}
              disabled={false}
              onSectionRegister={handleSectionRegister}
            />
          </Paper>
        </Box>

        {/* Side Navigation */}
        {hasSections && sections.length >= 2 && (
          <FormSideNavigation
            sections={sections}
            formTitle={formData.title || 'Form Navigation'}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        )}
      </Box>

      {/* JSON Dialog */}
      <Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Form JSON Structure</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(formData.json || [], null, 2))
              }}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => setJsonDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2,
              bgcolor: '#f5f5f5',
              maxHeight: '60vh',
              overflow: 'auto'
            }}
          >
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>
              {JSON.stringify(formData.json || [], null, 2)}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonDialogOpen(false)}>Close</Button>
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
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FormPreview