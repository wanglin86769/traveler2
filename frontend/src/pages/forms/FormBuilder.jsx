import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getForm, updateForm, submitForReview } from '@/services/formService'
import FormBuilderCanvas from '@/components/forms/FormBuilderCanvas'
import ElementPalette from '@/components/forms/elements/ElementPalette'
import ElementEditDialog from '@/components/forms/elements/ElementEditDialog'
import ElementFactory from '@/utils/elementFactory'
import { FORM_ELEMENT_DEFINITIONS } from '@/components/forms/elements/elementDefinitions'
import { updateSectionNumbers } from '@/utils/sectionNumbering'

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'

import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Visibility as PreviewIcon,
  Send as SendIcon,
  InfoOutlined
} from '@mui/icons-material'

function FormBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Use React Query to fetch form data
  const { data: currentForm, isLoading, error } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateForm(id, data),
    onSuccess: (data) => {
      setSnackbar({ open: true, message: 'Form updated successfully', severity: 'success' })
      setInitElements(JSON.parse(JSON.stringify(elements)))
      // Invalidate the form query to get fresh data
      queryClient.invalidateQueries({ queryKey: ['form', id] })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update form', severity: 'error' })
    }
  })

  const [elements, setElements] = useState([]) // Array of JSON objects
  const [initElements, setInitElements] = useState([]) // Store initial elements for comparison
  const [selectedElementIndex, setSelectedElementIndex] = useState(null)
  const [saving, setSaving] = useState(false)
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false)
  const [showGuideDialog, setShowGuideDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingElement, setEditingElement] = useState(null)
  const [editingElementIndex, setEditingElementIndex] = useState(null)

  // Load existing form data
  useEffect(() => {
    if (currentForm) {
      // Load JSON elements directly
      if (currentForm.json && Array.isArray(currentForm.json)) {
        // Update numbering
        const loadedElements = updateSectionNumbers(currentForm.json)
        setElements(loadedElements)
        // Save initial elements for comparison
        setInitElements(JSON.parse(JSON.stringify(loadedElements)))
      }
    }
  }, [currentForm])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    if (!over) return

    // Only handle reordering existing elements
    const activeName = active.id
    const overName = over.id

    setElements(prevItems => {
      const oldIndex = prevItems.findIndex(el => el.name === activeName)
      const newIndex = prevItems.findIndex(el => el.name === overName)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(prevItems, oldIndex, newIndex)
        // Update numbering
        return updateSectionNumbers(reordered)
      }
      return prevItems
    })
  }, [])

  /**
   * Scroll to the element at the specified index
   * @param {number} index - Element index
   */
  const scrollToElement = (index) => {
    // Wait for the DOM to update
    setTimeout(() => {
      const elements = document.querySelectorAll('[data-element-index]')
      if (elements && elements[index]) {
        elements[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }, 100)
  }

  const addElement = async (type, index = null) => {
    const definition = FORM_ELEMENT_DEFINITIONS.find(d => d.type === type)
    if (!definition) return

    // Use ElementFactory to create JSON object
    // schema already contains all default values, no need to pass overrides
    const newElement = ElementFactory.create(type)

    let insertedIndex = index

    setElements(prev => {
      let newElements
      if (index !== null && index >= 0 && index <= prev.length) {
        // Insert at the specified position
        newElements = [...prev]
        newElements.splice(index, 0, newElement)
      } else {
        // Append to the end
        newElements = [...prev, newElement]
        insertedIndex = prev.length
      }

      // Scroll to the newly added element to provide position feedback
      scrollToElement(insertedIndex)

      // Update numbering
      return updateSectionNumbers(newElements)
    })
  }

  const updateElement = useCallback((elementIndex, updates) => {
    setElements(prev => prev.map((element, idx) => {
      if (idx === elementIndex) {
        return { ...element, ...updates }
      }
      return element
    }))
  }, [])

  const deleteElement = useCallback((elementIndex) => {
    setElements(prev => {
      const newElements = prev.filter((_, idx) => idx !== elementIndex)
      if (selectedElementIndex === elementIndex) setSelectedElementIndex(null)
      // Update numbering
      return updateSectionNumbers(newElements)
    })
  }, [selectedElementIndex])

  const handleEditElement = useCallback((element, index) => {
    if (!element) {
      return
    }
    setEditingElement(element)
    setEditingElementIndex(index)
    setEditDialogOpen(true)
  }, [])

  const handleSubmitReview = async () => {
    if (!id) return

    try {
      setSaving(true)
      await submitForReview(id)
      
      // Invalidate the form query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['form', id] })
      
      setSnackbar({
        open: true,
        message: 'Form submitted for review successfully',
        severity: 'success'
      })
      setSubmitReviewOpen(false)
      
      // Show guide dialog after successful submission
      setShowGuideDialog(true)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit for review',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGoToReviewers = () => {
    setShowGuideDialog(false)
    // Clear form cache before navigation to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['form', id] })
    navigate(`/forms/${id}/reviewers`)
  }

  const handleCopyElement = useCallback((element) => {
    setElements(prev => {
      const index = prev.findIndex(el => el.name === element.name)
      if (index === -1) return prev

      // Clone the element
      const clonedElement = ElementFactory.clone(element)

      // Insert after the original element
      const newElements = [...prev]
      newElements.splice(index + 1, 0, clonedElement)
      // Update numbering
      return updateSectionNumbers(newElements)
    })
  }, [])

  const handleSaveElement = (updatedElement) => {
    if (editingElement && editingElementIndex !== null) {
      // Update the element at the specific index
      const newElements = updateSectionNumbers([
        ...elements.slice(0, editingElementIndex),
        updatedElement,
        ...elements.slice(editingElementIndex + 1)
      ])

      // Update elements
      setElements(newElements)

      // Close dialog
      setEditDialogOpen(false)
      setEditingElement(null)
      setEditingElementIndex(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Refer to original version, only send json field
      const data = {
        json: elements // Use json field, corresponding to the html field in original version
      }

      // Compare current elements with initial elements
      const currentElementsJson = JSON.stringify(elements)
      const initElementsJson = JSON.stringify(initElements)

      if (currentElementsJson === initElementsJson) {
        setSnackbar({ open: true, message: 'No changes to save', severity: 'info' })
        setSaving(false)
        return
      }

      updateMutation.mutate({ id, data })
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Save failed', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Navigate to preview page
    navigate(`/forms/${id}/preview`)
  }

  const selectedElement = selectedElementIndex !== null ? elements[selectedElementIndex] : null

  // Show loading state when fetching form data
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Alert severity="error">Error loading form: {error.message}</Alert>
      </Box>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexShrink: 0 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
            Edit Form
          </Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setSubmitReviewOpen(true)}
            disabled={elements.length === 0 || saving || currentForm?.status !== 0}
            size="small"
            sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
          >
            Submit for review
          </Button>
          <Button
            variant="contained"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
            disabled={elements.length === 0}
            size="small"
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || elements.length === 0 || currentForm?.status !== 0}
            size="small"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Left Panel - Element Palette */}
          <Paper
            variant="outlined"
            id="palette-panel"
            sx={{
              flexBasis: '25%',
              minWidth: 200,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-start'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ flexShrink: 0 }}>
              Form Elements
            </Typography>
            <Divider sx={{ mb: 2, flexShrink: 0 }} />
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <ElementPalette onAdd={addElement} />
            </Box>
          </Paper>

          {/* Center - Canvas Area */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Form Meta - Display Only */}
            {currentForm && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3, flexShrink: 0 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                  {currentForm.title || 'Untitled Form'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    Type: <span style={{ color: '#212529', marginLeft: '4px', fontWeight: 500 }}>{currentForm.formType || 'normal'}</span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    Status: <span style={{ color: '#212529', marginLeft: '4px', fontWeight: 500 }}>
                      {currentForm.status === 0 ? 'draft' :
                       currentForm.status === 0.5 ? 'submitted for review' :
                       currentForm.status === 1 ? 'released' :
                       currentForm.status === 2 ? 'archived' :
                       'unknown'}
                    </span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    Version: <span style={{ color: '#212529', marginLeft: '4px', fontWeight: 500 }}>{currentForm._v || 0}</span>
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Canvas - Form Builder Canvas */}
            <Box
              id="canvas-area"
              sx={{ flexGrow: 1, minHeight: 0 }}
            >
              <FormBuilderCanvas
                elements={elements}
                selectedElementIndex={selectedElementIndex}
                onSelectElement={(index) => {
                  setSelectedElementIndex(index)
                }}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                onEditElement={handleEditElement}
                onCopyElement={handleCopyElement}
              />
            </Box>
          </Box>
        </Box>

        {/* Submit Review Dialog */}
        <Dialog open={submitReviewOpen} onClose={() => setSubmitReviewOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit for Review</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined sx={{ color: '#FF9800', fontSize: 24 }} />
              <Typography variant="body1" gutterBottom sx={{ mb: 0 }}>
                Are you sure you want to submit for review?
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              After submission, the form will enter the review process. You can add reviewers on the reviewer page.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitReviewOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Guide Dialog - After successful submission */}
        <Dialog open={showGuideDialog} onClose={() => setShowGuideDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submission Successful</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined sx={{ color: '#FF9800', fontSize: 24 }} />
              <Typography variant="body1" gutterBottom sx={{ mb: 0 }}>
                Would you like to go to the reviewer page to add reviewers?
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              On the reviewer page, you can add reviewers and manage the review process.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowGuideDialog(false)}>Later</Button>
            <Button
              onClick={handleGoToReviewers}
              variant="contained"
            >
              Go Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Element Edit Dialog */}
        <ElementEditDialog
          open={editDialogOpen}
          element={editingElement}
          onSave={handleSaveElement}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingElement(null)
            setEditingElementIndex(null)
          }}
        />

        {/* Snackbar for notifications - Fixed at top center */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pt: 2
          }}
        >
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </DndContext>
  )
}

export default FormBuilder