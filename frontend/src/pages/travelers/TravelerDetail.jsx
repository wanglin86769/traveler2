import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useRef, useEffect } from 'react'
import { getTraveler, getTravelerData, getDiscrepancyLogs } from '@/services/travelerService'
import { useTravelerNavigation } from '@/hooks/useTravelerNavigation'
import FormSideNavigation from '@/components/forms/FormSideNavigation'
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer'
import FieldWithHistory from '@/components/travelers/FieldWithHistory'
import DiscrepancyForm from '@/components/travelers/discrepancy/DiscrepancyForm'
import TravelerStatusControls from '@/components/travelers/TravelerStatusControls'
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'

// Main TravelerDetail component - Read-only view
function TravelerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Show/Hide state
  const [showHistory, setShowHistory] = useState(true)
  const [showNotesContent, setShowNotesContent] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState({})

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
  
    const { data: discrepancyLogsResponse } = useQuery({
      queryKey: ['traveler-discrepancy-logs', id],
      queryFn: () => getDiscrepancyLogs(id),
      enabled: !!id && !!hasDiscrepancyForm
    })
  
    const discrepancyLogs = discrepancyLogsResponse?.data || []  // Get discrepancy form fields
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
  const { data: travelerDataResponse } = useQuery({
    queryKey: ['travelerData', id],
    queryFn: () => getTravelerData(id),
    enabled: !!id,
  })
  
  // Destructure data and notes
  const travelerData = travelerDataResponse?.data || []
  const travelerNotes = travelerDataResponse?.notes || []
  
  
  
  const hasSections = sections.length > 0
  
  // Handle note toggle
  const handleToggleNotes = (name) => {
    // First ensure global showNotesContent is true
    setShowNotesContent(prev => prev || true)
    // Then toggle the individual field's notes
    setExpandedNotes(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }
  
  // Empty handlers for read-only mode (not used but required by component interface)
  const handleFieldSave = () => {
    // No-op in read-only mode
  }
  
  const handleFieldReset = () => {
    // No-op in read-only mode
  }
  
  const handleNoteSubmit = () => {
    // No-op in read-only mode
  }
  
  const handleNoteDelete = () => {
    // No-op in read-only mode
  }
  
  const handleStatusChange = () => {
    // No-op in read-only mode
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
  
// Render error state
  if (!currentTraveler) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Traveler not found
        </Alert>
      </Box>
    )
  }

  // Check if traveler has form data
  if (!currentTraveler.form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Traveler data is incomplete. This traveler may have been created before the form structure was added. Please recreate this traveler from a released form.
        </Alert>
        <Button 
          sx={{ mt: 2 }}
          onClick={() => navigate('/released-forms')}
          variant="contained"
        >
          Go to Released Forms
        </Button>
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
                Traveler Detail (Read-Only)
              </Typography>
            </Box>
            
            {/* Status display - read-only */}
            <TravelerStatusControls
              currentStatus={currentTraveler.status}
              onStatusChange={handleStatusChange}
              travelerId={id}
              readOnly={true}
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
          
          {/* Discrepancy Log */}
          <DiscrepancyForm
            discrepancyFormFields={discrepancyFormFields}
            discrepancyLogs={discrepancyLogs}
            onSubmit={() => {}}
            travelerId={id}
            readOnly={true}
          />
          
          {/* Form elements */}
          {currentTraveler.form.json && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                  Traveler
                </Typography>
              </Box>
              <Box id="traveler-section" ref={travelerRef}>
                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
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
                            readOnly={true}
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
                        onChange={() => {}}
                        onSave={handleFieldSave}
                        onReset={handleFieldReset}
                        onNotesToggle={handleToggleNotes}
                        showNotes={expandedNotes[element.name]}
                        onNoteSubmit={handleNoteSubmit}
                        onNoteDelete={handleNoteDelete}
                        notes={fieldNotes}
                        history={fieldHistory}
                        saving={false}
                        showHistoryGlobal={showHistory}
                        showNotesContentGlobal={showNotesContent}
                        travelerId={id}
                        readOnly={true}
                      />
                    )
                  })}
                </Box>
              </Box>
            </>
          )}
        </Box>
        
        {/* Side Navigation */}
        {hasSections && (
          <FormSideNavigation
            sections={sections}
            formTitle={currentTraveler.title || 'Traveler Detail'}
            activeSection={activeSection}
            onSectionClick={handleScrollToSection}
          />
        )}
      </Box>
    </Box>
  )
}

export default TravelerDetail