import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useRef, useEffect } from 'react'
import { getTraveler, getTravelerData, submitTravelerData, submitTravelerNote, updateTravelerNote, deleteTravelerNote, updateStatus, getDiscrepancyLogs, addDiscrepancyRecords } from '@/services/travelerService'
import { useTravelerNavigation } from '@/hooks/useTravelerNavigation'
import FormSideNavigation from '@/components/forms/FormSideNavigation';
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer'
import FieldWithHistory from '@/components/travelers/FieldWithHistory';
import DiscrepancyForm from '@/components/travelers/discrepancy/DiscrepancyForm';
import TravelerStatusControls from '@/components/travelers/TravelerStatusControls'
import TravelerInfo from '@/components/travelers/TravelerInfo'
import { ArrowBack as BackIcon } from '@mui/icons-material'

import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Paper
} from '@mui/material'

// Main TravelerInput component
function TravelerInput() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [savingFields, setSavingFields] = useState(new Set())
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [expandedNotes, setExpandedNotes] = useState({})
  // Show/Hide state
  const [showHistory, setShowHistory] = useState(true)
  const [showNotesContent, setShowNotesContent] = useState(false)

  // Fetch traveler details using React Query
  const { data: currentTraveler, isLoading: loading, error: travelerError } = useQuery({
    queryKey: ['traveler', id],
    queryFn: () => getTraveler(id),
    enabled: !!id,
  })

  // Use traveler navigation hook
  const {
    sections,
    activeSection,
    handleSectionRegister,
    handleScrollToSection,
    discrepancyRef,
    travelerRef,
    hasDiscrepancyForm
  } = useTravelerNavigation(currentTraveler)

  // Get discrepancy history records
  const { data: discrepancyLogsResponse, isLoading: loadingLogs } = useQuery({
    queryKey: ['traveler-discrepancy-logs', id],
    queryFn: () => getDiscrepancyLogs(id),
    enabled: !!id && !!hasDiscrepancyForm
  })

  const discrepancyLogs = discrepancyLogsResponse?.data || []
  
  // Get discrepancy form fields
  const discrepancyFormFields = useMemo(() => {
    if (!currentTraveler?.discrepancyForm?.json || !Array.isArray(currentTraveler.discrepancyForm.json)) {
      return []
    }
    // Extract top-level input fields (excluding sections, instructions, etc.)
    return currentTraveler.discrepancyForm.json.filter(element =>
      element.name &&
      element.type !== 'section' &&
      element.type !== 'instruction' &&
      element.type !== 'figure'
    )
  }, [currentTraveler?.discrepancyForm?.json])
  
  // Fetch traveler data using React Query
  const { data: travelerDataResponse, refetch } = useQuery({
    queryKey: ['travelerData', id],
    queryFn: () => getTravelerData(id),
    enabled: !!id,
    staleTime: 0, // Data expires immediately, ensure immediate refetch after invalidateQueries
  })
  
  // Destructure data and notes
  const travelerData = travelerDataResponse?.data || []
  const travelerNotes = travelerDataResponse?.notes || []
  
  
  
  const hasSections = sections.length > 0
  
  // Determine if inputs should be enabled based on traveler status
  // Only status === 1 (In Progress) allows input
  const isInputEnabled = currentTraveler?.status === 1
  
  // Mutation to save individual field
  const saveFieldMutation = useMutation({
    mutationFn: ({ travelerId, name, value, type }) => {
      return submitTravelerData(travelerId, name, value, type)
    },
    onMutate: ({ name }) => {
      setSavingFields(prev => new Set([...prev, name]))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travelerData', id])
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to save', severity: 'error' })
    },
    onSettled: (_data, _error, variables) => {
      if (variables && variables.name) {
        setSavingFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(variables.name)
          return newSet
        })
      }
    }
  })
  
  // Mutation to submit note
  const submitNoteMutation = useMutation({
    mutationFn: ({ travelerId, name, value }) => {
      return submitTravelerNote(travelerId, name, value)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travelerData', id])
      setSnackbar({ open: true, message: 'Note added', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to add note', severity: 'error' })
    }
  })
  
  // Mutation to update note
  const updateNoteMutation = useMutation({
    mutationFn: ({ travelerId, noteId, value }) => {
      return updateTravelerNote(travelerId, noteId, value)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travelerData', id])
      setSnackbar({ open: true, message: 'Note updated', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to update note', severity: 'error' })
    }
  })
  
  // Mutation to delete note
  const deleteNoteMutation = useMutation({
    mutationFn: ({ travelerId, noteId }) => {
      return deleteTravelerNote(travelerId, noteId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['travelerData', id])
      setSnackbar({ open: true, message: 'Note deleted', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to delete note', severity: 'error' })
    }
  })
  
  // Mutation to update status
  const updateStatusMutation = useMutation({
    mutationFn: (status) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['traveler', id])
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to update status', severity: 'error' })
    }
  })
  
  // Mutation to submit Discrepancy record
  const submitDiscrepancyMutation = useMutation({
    mutationFn: (formData) => addDiscrepancyRecords(id, null, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['traveler-discrepancy-logs', id])
      setSnackbar({ open: true, message: 'Discrepancy record submitted', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message || 'Failed to submit discrepancy', severity: 'error' })
    }
  })
  
  const handleDiscrepancySubmit = (formData, onClose) => {
    submitDiscrepancyMutation.mutate(formData, {
      onSuccess: () => {
        // Close dialog on successful submission
        if (onClose) {
          onClose()
        }
      }
    })
  }
  
  const handleFieldSave = (name, value, type) => {
    // file type doesn't need to be saved, as file is already saved through upload interface
    if (type === 'file') {
      return
    }
    // Convert number type value from string to number
    let convertedValue = value
    if (type === 'number' && value !== '') {
      convertedValue = parseFloat(value)
    }
    saveFieldMutation.mutate({ travelerId: id, name, value: convertedValue, type })
  }
  
  const handleFieldReset = (name) => {
    // Reset is handled in FieldWithHistory component via setLocalValue(value)
    // This function is kept for future extensibility if needed
  }
  
  const handleNoteSubmit = (name, value, editingNote) => {
    if (editingNote) {
      updateNoteMutation.mutate({ travelerId: id, name, noteId: editingNote._id, value })
    } else {
      submitNoteMutation.mutate({ travelerId: id, name, value })
    }
  }
  
  const handleNoteUpdate = (note, value) => {
    // Handle case where note is passed as an object with note and value properties
    let actualNote, actualValue;
    
    if (note.note) {
      // Format: { note: {...}, value: "new value" }
      actualNote = note.note;
      actualValue = value; // Use the second parameter which contains the new value
    } else {
      // Format: note object directly
      actualNote = note;
      actualValue = value;
    }
    
    updateNoteMutation.mutate({ 
      travelerId: id, 
      name: actualNote.name, 
      noteId: actualNote._id,  // Use actualNote._id directly
      value: actualValue 
    })
  }
  
  const handleNoteDelete = (name, noteId) => {
    deleteNoteMutation.mutate({ travelerId: id, name, noteId })
  }
  
  const handleToggleNotes = (name) => {
    // First ensure global showNotesContent is true
    setShowNotesContent(prev => prev || true)
    // Then toggle the individual field's notes
    setExpandedNotes(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }
  
  // Status action handler
  const handleStatusChange = (status) => {
    updateStatusMutation.mutate(status)
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  
  if (travelerError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load traveler: {travelerError.message}
        </Alert>
      </Box>
    )
  }
  
  if (!currentTraveler || !currentTraveler.form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Traveler not found
        </Alert>
      </Box>
    )
  }
  
  // Build fieldData mapping - get the latest value for each field
  const dataMap = {}
  if (travelerData) {
    travelerData.forEach(item => {
      if (!dataMap[item.name] || item.inputOn > (dataMap[item.name]?.inputOn || 0)) {
        dataMap[item.name] = item
      }
    })
  }
  
  // Build history map - all records for each field
  const historyMap = {}
  if (travelerData) {
    travelerData.forEach(item => {
      if (!historyMap[item.name]) {
        historyMap[item.name] = []
      }
      historyMap[item.name].push(item)
    })
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Snackbar - placed at top center */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
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
            mb: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate(-1)}
                variant="outlined"
              >
                Back
              </Button>
              <Typography variant="h6" fontWeight={600}>
                Traveler Input
              </Typography>
            </Box>
            
            {/* Status action buttons */}
            <TravelerStatusControls
              currentStatus={currentTraveler.status}
              onStatusChange={handleStatusChange}
              travelerId={id}
            />
            
            {/* Toggle History and Notes buttons */}
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowHistory(!showHistory)}
                sx={{
                  borderColor: showHistory ? '#2196F3' : '#e0e0e0',
                  color: showHistory ? '#2196F3' : '#757575',
                  '&:hover': {
                    borderColor: '#2196F3',
                    bgcolor: showHistory ? '#E3F2FD' : '#f5f5f5'
                  }
                }}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setShowNotesContent(prev => {
                    const newVal = !prev
                    if (newVal) { setShowHistory(true) }
                    return newVal
                  })
                }}
                sx={{
                  borderColor: showNotesContent ? '#2196F3' : '#e0e0e0',
                  color: showNotesContent ? '#2196F3' : '#757575',
                  '&:hover': {
                    borderColor: '#2196F3',
                    bgcolor: showNotesContent ? '#E3F2FD' : '#f5f5f5'
                  }
                }}
              >
                {showNotesContent ? 'Hide Notes' : 'Show Notes'}
              </Button>
            </Box>
          </Box>
          
          {/* Traveler Information */}
          <TravelerInfo traveler={currentTraveler} />
          
          {/* Discrepancy Log - Only show if hasDiscrepancyForm is true */}
          {hasDiscrepancyForm && (
            <DiscrepancyForm
              discrepancyFormFields={discrepancyFormFields}
              discrepancyLogs={discrepancyLogs}
              onSubmit={handleDiscrepancySubmit}
              travelerId={id}
            />
          )}
          
          {/* Form elements */}
          {currentTraveler.form.json && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                  Traveler
                </Typography>
              </Box>
              <Box id="traveler-section" ref={travelerRef}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  {currentTraveler.form.json.map((element) => {
                    // section, instruction and figure controls are rendered directly without history and notes
                    if (element.type === 'section' || element.type === 'instruction' || element.type === 'figure') {
                      return (
                        <Box
                          key={element.name}
                          id={element.id || element.name}
                          ref={(el) => {
                            if (el && element.type === 'section') {
                              handleSectionRegister(element.id || element.name, el)
                            }
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'transparent',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                              bgcolor: '#E3F2FD'
                            },
                            scrollMarginTop: 80
                          }}
                        >
                          <InputFieldRenderer
                            element={element}
                            value={''}
                            onChange={() => {}}
                            mode="fill"
                            travelerId={id}
                          />
                        </Box>
                      )
                    }
                    
                    // Other controls are wrapped with FieldWithHistory to display history and notes
                    const fieldNotes = travelerNotes?.filter(item =>
                      item.name === element.name
                    ) || []
                    
                    // Get field value, ensure passing value instead of entire object
                    const fieldValue = dataMap[element.name]?.value || ''
                    
                    // Get history records - all records for this field
                    const fieldHistory = historyMap[element.name] || []
                    
                    return (
                      <FieldWithHistory
                        key={element.name}
                        element={element}
                        value={fieldValue}
                        onChange={(name, newValue) => {
                          // For file uploads, we handle the change in FieldWithHistory
                          // For other types, we can update local state if needed
                        }}
                        onSave={handleFieldSave}
                        onReset={handleFieldReset}
                        onNotesToggle={handleToggleNotes}
                        showNotes={expandedNotes[element.name]}
                        onNoteSubmit={handleNoteSubmit}
                        onNoteUpdate={handleNoteUpdate}
                        onNoteDelete={handleNoteDelete}
                        notes={fieldNotes}
                        history={fieldHistory}
                        saving={savingFields.has(element.name)}
                        showHistoryGlobal={showHistory}
                        showNotesContentGlobal={showNotesContent}
                        travelerId={id}
                        readOnly={!isInputEnabled}
                      />
                    )
                  })}
                </Paper>
              </Box>
            </>
          )}
        </Box>
        
        {/* Side Navigation */}
        {hasSections && (
          <FormSideNavigation
            sections={sections}
            formTitle={currentTraveler.title || 'Traveler Navigation'}
            activeSection={activeSection}
            onSectionClick={handleScrollToSection}
          />
        )}
      </Box>
    </Box>
  )
}

export default TravelerInput