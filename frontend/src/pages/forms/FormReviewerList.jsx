import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tooltip
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import { getForm, getReviewInfo, addReviewer, removeReviewer } from '@/services/formService'
import { getUsers } from '@/services/userService'

const reviewResultMap = {
  '1': { label: 'Approved', color: 'success' },
  '2': { label: 'Requested for change', color: 'warning' }
}

function FormReviewerList() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [reviewerName, setReviewerName] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewerToDelete, setReviewerToDelete] = useState(null)

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

  // Get users list
  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    retry: false
  })

  const users = usersResponse?.data || []

  // Mutation to add reviewer
  const addReviewerMutation = useMutation({
    mutationFn: ({ uid, name }) => addReviewer(id, uid, name),
    onSuccess: () => {
      setReviewerName('')
      setSelectedUser(null)
      queryClient.invalidateQueries(['form-review', id])
    }
  })

  // Mutation to remove reviewer
  const removeReviewerMutation = useMutation({
    mutationFn: (requestId) => removeReviewer(id, requestId),
    onSuccess: () => {
      setDeleteDialogOpen(false)
      setReviewerToDelete(null)
      queryClient.invalidateQueries(['form-review', id])
    }
  })

  const handleAddReviewer = (user) => {
    setSelectedUser(user)
    setReviewerName(user.name)
  }

  const handleRequestReview = () => {
    if (selectedUser) {
      addReviewerMutation.mutate({ uid: selectedUser._id, name: selectedUser.name })
    }
  }

  const handleDeleteReviewer = (requestId) => {
    setReviewerToDelete(requestId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteReviewer = () => {
    if (reviewerToDelete) {
      removeReviewerMutation.mutate(reviewerToDelete)
    }
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
          Reviewer list for form{' '}
          <Typography 
            component="span" 
            variant="h4"
            fontWeight={600}
            sx={{ 
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => navigate(`/forms/${id}`)}
          >
            {formData.title}
          </Typography>
        </Typography>
      </Box>

      {/* Form Info */}
      <Paper sx={{ p: 2, mb: 2, border: '1px solid #E8E8E8' }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Type: <strong>{formData.formType}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: <strong>{formData.status === 0.5 ? 'Under Review' : 'Draft'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version: <strong>{formData._v}</strong>
          </Typography>
        </Box>
      </Paper>

      {/* Add Reviewer */}
      {formData.status === 0.5 && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid #E8E8E8' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search Reviewer"
              placeholder="Type reviewer name or ID to search..."
              value={reviewerName}
              onChange={(e) => {
                setReviewerName(e.target.value)
                setSelectedUser(null)
              }}
              size="small"
              fullWidth
              sx={{ maxWidth: 400 }}
            />
            <Button
              variant="contained"
              onClick={handleRequestReview}
              disabled={!selectedUser}
            >
              Request review
            </Button>
          </Box>

          {/* User Suggestions */}
          {reviewerName && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {usersLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading users...
                </Typography>
              ) : usersError ? (
                <Typography variant="body2" color="error">
                  Failed to load users. You may not have permission to view user list.
                </Typography>
              ) : users && users.length > 0 ? (
                users
                  .filter(user =>
                    (user.name?.toLowerCase().includes(reviewerName.toLowerCase()) ||
                     user._id?.toLowerCase().includes(reviewerName.toLowerCase())) &&
                    !reviewRequests.some(req => req._id === user._id)
                  )
                  .slice(0, 5)
                  .map(user => {
                    const hasReviewerRole = Array.isArray(user.roles) && user.roles.includes('reviewer')
                    const isSelected = selectedUser?._id === user._id
                    return (
                      <Chip
                        key={user._id}
                        icon={<PersonIcon />}
                        label={`${user.name} ${!hasReviewerRole ? '(no reviewer role)' : ''}`}
                        onClick={() => handleAddReviewer(user)}
                        clickable={hasReviewerRole}
                        color={isSelected ? 'primary' : (hasReviewerRole ? 'default' : 'default')}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ 
                          opacity: hasReviewerRole ? 1 : 0.6,
                          border: isSelected ? '2px solid #1976d2' : undefined
                        }}
                      />
                    )
                  })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No users found matching "{reviewerName}"
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* Review Results Warning */}
      {formData.status === 0 && reviewResults.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This form was previously submitted for review and has {reviewResults.length} review result(s).
          Review requests have been closed.
        </Alert>
      )}

      {/* Reviewers Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #E8E8E8' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reviewer</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" />
                  Requested on
                </Box>
              </TableCell>
              <TableCell>Latest review result</TableCell>
              {formData.status === 0.5 && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {reviewRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={formData.status === 0.5 ? 5 : 4} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No reviewers added yet
                    </Typography>
                    {formData.status === 0.5 && (
                      <Typography variant="caption" color="text.secondary">
                        Use the search box above to add reviewers
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              reviewRequests.map((request) => {
                const latestResult = reviewResults
                  .filter(r => r.reviewerId === request._id)
                  .sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0]

                return (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {request.reviewer?.name || request._id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.requestedOn ? new Date(request.requestedOn).toLocaleString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {latestResult ? (
                        <Chip
                          label={reviewResultMap[latestResult.result]?.label || latestResult.result}
                          color={reviewResultMap[latestResult.result]?.color || 'default'}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    {formData.status === 0.5 && (
                      <TableCell>
                        <Tooltip title="Remove reviewer" placement="left">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReviewer(request._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Reviewer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this reviewer from the review process?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteReviewer} 
            color="error" 
            variant="contained"
            disabled={removeReviewerMutation.isPending}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FormReviewerList