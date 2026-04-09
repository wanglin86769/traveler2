import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Paper
} from '@mui/material'

import {
  ArrowBack as BackIcon
} from '@mui/icons-material'

function ReleasedFormDetail() {
const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

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
              onClick={() => navigate('/released-forms')}
              variant="outlined"
            >
              Back
            </Button>
            <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
              Released Form Detail
            </Typography>
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
    </Box>
  )
}

export default ReleasedFormDetail