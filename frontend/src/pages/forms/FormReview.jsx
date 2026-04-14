import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Alert,
  Chip,
  Divider,
  Snackbar
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import { getForm, getReviewInfo, submitReviewResult } from '@/services/formService'
import { useAuth } from '@/contexts/AuthContext'
import FormRenderer from '@/components/forms/FormRenderer'
import { getFormStatusLabel, getFormStatusColor } from '@/utils/status'

const reviewResultMap = {
  '1': { label: 'Approved', icon: <CheckIcon />, color: 'success' },
  '2': { label: 'Requested for change', icon: <ErrorIcon />, sx: { backgroundColor: '#FF8A80', color: 'white' } }
}

function FormReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [result, setResult] = useState('')
  const [comment, setComment] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Get form information
  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id),
  })

  // Get review information
  const { data: reviewInfo, isLoading: reviewLoading } = useQuery({
    queryKey: ['form-review', id],
    queryFn: () => getReviewInfo(id),
    enabled: !!id
  })

  // Submit review result
  const submitMutation = useMutation({
    mutationFn: () => submitReviewResult(id, result, comment, form?._v),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Review result submitted successfully',
        severity: 'success'
      })
      setConfirmDialogOpen(false)
      setResult('')
      setComment('')
      queryClient.invalidateQueries(['form-review', id])
      queryClient.invalidateQueries(['form', id])
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit review result',
        severity: 'error'
      })
    }
  })

  const handleSubmitReview = () => {
    if (!result) {
      setSnackbar({
        open: true,
        message: 'Please select a review result',
        severity: 'warning'
      })
      return
    }
    setConfirmDialogOpen(true)
  }

  const handleConfirmSubmit = () => {
    submitMutation.mutate()
  }

  if (formLoading || reviewLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Form not found</Typography>
      </Box>
    )
  }

  const formData = form
  const review = reviewInfo || {}
  const reviewRequests = review.reviewRequests || []
  const reviewResults = review.reviewResults || []
  const currentUserId = user._id?.toString() || user._id

  // Check if current user is a reviewer (either in requests or has submitted a review result)
  const isReviewer = reviewRequests.some(req => req._id?.toString() === currentUserId) ||
    reviewResults.some(r => {
      // Check both reviewerId and reviewer._id
      const reviewerId = r.reviewerId?.toString() || r.reviewer?._id?.toString()
      return reviewerId === currentUserId
    })
  const myLatestResult = reviewResults
    .filter(r => {
      const reviewerId = r.reviewerId?.toString() || r.reviewer?._id?.toString()
      return reviewerId === currentUserId
    })
    .sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0]

  if (!isReviewer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You are not a reviewer for this form
        </Alert>
      </Box>
    )
  }

  // Allow viewing review history even if form is not under review status
  // This enables reviewers to see their past review results
  if (formData.status !== 0.5 && !myLatestResult) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          This form is not under review status
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={600} sx={{ flexGrow: 1 }}>
          Review Form
        </Typography>
      </Box>

      {/* Form Info */}
      <Paper sx={{ p: 2, mb: 2, border: '1px solid #E8E8E8' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '20px' }}>
          {formData.title}
        </Typography>
        {formData.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {formData.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Version: <strong>{formData._v}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: <strong>{formData.formType}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: <strong>{getFormStatusLabel(formData.status)}</strong>
          </Typography>
        </Box>
      </Paper>

      {/* Review History */}
      {reviewResults.length > 0 && (
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #E8E8E8' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Review History
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reviewResults
                    .sort((a, b) => new Date((b.submittedOn || b._doc?.submittedOn)) - new Date((a.submittedOn || a._doc?.submittedOn)))
                    .map((result, index) => {
                      // Access both direct properties and _doc for mongoose documents
                      const reviewerId = result.reviewerId || result._doc?.reviewerId
                      const resultValue = result.result || result._doc?.result
                      const submittedOn = result.submittedOn || result._doc?.submittedOn
                      const comment = result.comment || result._doc?.comment
                      const v = result.v || result._doc?.v
                      const reviewer = result.reviewer || result._doc?.reviewer
                      
                      console.log('Rendering review result:', { reviewerId, resultValue, submittedOn, comment, v, reviewer })
                      
                      return (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 2, 
                            borderLeft: 3, 
                            borderColor: resultValue === '1' ? 'success.main' : 'error.main',
                            bgcolor: resultValue === '1' ? '#E8F5E9' : '#FFEBEE'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Chip
                              icon={reviewResultMap[resultValue]?.icon}
                              label={reviewResultMap[resultValue]?.label}
                              {...(reviewResultMap[resultValue]?.sx
                                ? { sx: reviewResultMap[resultValue].sx }
                                : { color: reviewResultMap[resultValue]?.color })}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {reviewer?.name || reviewerId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              {submittedOn ? new Date(submittedOn).toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                          {comment && (
                            <Typography variant="body2" sx={{ ml: 4 }}>
                              <em>"{comment}"</em>
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                </Box>
              </Paper>
            )}      {/* Current Review Status */}
      {myLatestResult ? (
        <Alert 
          severity={myLatestResult.result === '1' ? 'success' : 'warning'}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {reviewResultMap[myLatestResult.result]?.icon}
            <Typography>
              You have already submitted: <strong>{reviewResultMap[myLatestResult.result]?.label}</strong>
              {myLatestResult.comment && (
                <> with comment: "{myLatestResult.comment}"</>
              )}
            </Typography>
          </Box>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb:2 }}>
          Please review this form and submit your result
        </Alert>
      )}

      {/* Form Preview */}
      <Paper sx={{ p: 3, mb: 2, border: '1px solid #E8E8E8' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Form Content
        </Typography>
        <Box sx={{ mt: 2 }}>
          <FormRenderer 
            elements={formData.json || []}
            disabled={true}
            mode="preview"
          />
        </Box>
      </Paper>

      {/* Review Form */}
      <Paper sx={{ p: 3, border: '1px solid #E8E8E8' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Submit Review Result
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please review this form and submit your result. If you request for change, please provide a comment explaining what needs to be modified.
        </Typography>

        <Box sx={{ mb: 3, opacity: formData.status !== 0.5 ? 0.5 : 1, pointerEvents: formData.status !== 0.5 ? 'none' : 'auto' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Review Result
          </Typography>
          <RadioGroup
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <FormControlLabel 
              value="1" 
              control={<Radio />} 
              label="Approve"
              disabled={formData.status !== 0.5}
            />
            <FormControlLabel 
              value="2" 
              control={<Radio />} 
              label="Request for change"
              disabled={formData.status !== 0.5}
            />
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 3, opacity: formData.status !== 0.5 ? 0.5 : 1, pointerEvents: formData.status !== 0.5 ? 'none' : 'auto' }}>
          <TextField
            label="Comment"
            placeholder="Please provide your review comments..."
            multiline
            rows={6}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            helperText={result === '2' ? "Required when requesting for change" : "Optional"}
            disabled={formData.status !== 0.5}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={formData.status !== 0.5}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!result || submitMutation.isPending || formData.status !== 0.5}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Review Result</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit the following review result?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={reviewResultMap[result]?.icon}
              label={reviewResultMap[result]?.label}
              {...(reviewResultMap[result]?.sx
                ? { sx: reviewResultMap[result].sx }
                : { color: reviewResultMap[result]?.color })}
            />
          </Box>
          {comment && (
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Comment: "{comment}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            color="primary"
            variant="contained"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Confirm'}
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

export default FormReview