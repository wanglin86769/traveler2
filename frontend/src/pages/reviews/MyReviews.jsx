import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination,
  Alert,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Error as ReworkIcon
} from '@mui/icons-material'
import { getForms, getMyReviews } from '@/services/formService'

const reviewStatusMap = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rework: { label: 'Requested for change', color: 'error' }
}

function MyReviews() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentTab, setCurrentTab] = useState(0)

  const tabs = [
    { label: 'Pending Reviews', status: 'pending' },
    { label: 'Completed Reviews', status: 'completed' }
  ]

  // Get current user's pending review forms
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-reviews', { page: page + 1, limit: rowsPerPage }],
    queryFn: () => getMyReviews({ page: page + 1, limit: rowsPerPage }),
    enabled: !!user && user.roles?.includes('reviewer')
  })

  const items = data?.data || []
  const pagination = data?.pagination || { total: 0 }

  const handleViewReview = (form) => {
    navigate(`/forms/${form._id}/review`)
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (!user || !user.roles?.includes('reviewer')) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          You need reviewer role to access this page
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        My Reviews
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'capitalize' } }}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      <Paper>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error">
              Failed to load reviews
            </Alert>
          </Box>
        ) : currentTab === 0 ? (
          // Pending Reviews
          <>
            {items.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No pending reviews
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Submitted On</TableCell>
                      <TableCell>Requested By</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((form) => {
                      const reviewRequest = form.__review?.reviewRequests?.find(req => req._id === user._id)
                      const latestResult = form.__review?.reviewResults
                        ?.filter(r => r.reviewerId === user._id)
                        ?.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0]
                      
                      return (
                        <TableRow key={form._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {form.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={latestResult 
                                ? reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].label 
                                : reviewStatusMap.pending.label
                              }
                              color={latestResult 
                                ? reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].color 
                                : reviewStatusMap.pending.color
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {form.formType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {form._v}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {reviewRequest?.requestedOn 
                                ? new Date(reviewRequest.requestedOn).toLocaleDateString()
                                : 'N/A'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {form.createdBy?.name || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewReview(form)}
                              title="Review"
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={items.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
          </>
        ) : (
          // Completed Reviews
          <>
            {items.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No completed reviews
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Submitted On</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items
                      .filter(form => {
                        const latestResult = form.__review?.reviewResults
                          ?.filter(r => r.reviewerId === user._id)
                          ?.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0]
                        return latestResult && latestResult.result !== undefined
                      })
                      .map((form) => {
                        const latestResult = form.__review?.reviewResults
                          ?.filter(r => r.reviewerId === user._id)
                          ?.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0]
                        
                        return (
                          <TableRow key={form._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {form.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={latestResult.result === '1' ? <ApprovedIcon /> : <ReworkIcon />}
                                label={latestResult.result === '1' ? 'Approved' : 'Requested for change'}
                                color={latestResult.result === '1' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {latestResult.comment || 'No comment'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {latestResult.submittedOn
                                  ? new Date(latestResult.submittedOn).toLocaleString()
                                  : 'N/A'
                                }
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewReview(form)}
                                title="View Details"
                              >
                                <ViewIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Box>
  )
}

export default MyReviews