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
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Error as ReworkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { getForms, getMyReviews } from '@/services/formService'

const reviewStatusMap = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rework: { label: 'Requested for change', sx: { backgroundColor: '#FF8A80', color: 'white' } }
}

function MyReviews() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentTab, setCurrentTab] = useState(0)
  const [isReloading, setIsReloading] = useState(false)

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
    setPage(0)
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
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        My Reviews
      </Typography>

      <Card>
        <CardContent>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} sx={{ textTransform: 'none' }} />
            ))}
          </Tabs>

          {/* Action button group */}
          <Box sx={{ display: 'flex', gap: 1, mt: 3, mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={isReloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RefreshIcon />}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
              onClick={async () => {
                setIsReloading(true)
                await queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
                setTimeout(() => setIsReloading(false), 500)
              }}
              disabled={isReloading}
            >
              {isReloading ? 'Reloading...' : 'Reload table'}
            </Button>
          </Box>

          {/* Action bar: left side item count config */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                sx={{ width: 80, height: '32px' }}
                InputProps={{ sx: { height: '32px' } }}
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </TextField>
              <Typography variant="body2">Rows per page</Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ border: '1px solid #E0E0E0' }} size="small">
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ border: '1px solid #E0E0E0' }}>Loading...</TableCell>
                  </TableRow>
                </TableBody>
              ) : error ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} align="center" color="error" sx={{ border: '1px solid #E0E0E0' }}>
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : currentTab === 0 ? (
                // Pending Reviews
                <>
                  {items.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ border: '1px solid #E0E0E0' }}>No pending reviews</TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Version</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Requested By</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Requested On</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items
                          .filter(form => {
                            // Check if the form should be in pending reviews
                            const latestResult = form.myLatestResult
                            const reviewRequest = form.myReviewRequest

                            // No result submitted yet -> pending
                            if (!latestResult || latestResult.result === undefined) {
                              return true
                            }

                            // Result was submitted, but a new review request was made after -> pending
                            if (reviewRequest && latestResult.submittedOn && reviewRequest.requestedOn) {
                              return new Date(reviewRequest.requestedOn) > new Date(latestResult.submittedOn)
                            }

                            return false
                          })
                          .map((form) => {
                          const reviewRequest = form.myReviewRequest
                          const latestResult = form.myLatestResult

                          return (
                            <TableRow key={form._id} hover>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Typography fontWeight={500}>{form.title}</Typography>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Chip
                                  label={latestResult
                                    ? reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].label
                                    : reviewStatusMap.pending.label
                                  }
                                  {...(latestResult
                                    ? (reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].sx
                                      ? { sx: reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].sx }
                                      : { color: reviewStatusMap[latestResult.result === '1' ? 'approved' : 'rework'].color })
                                    : (reviewStatusMap.pending.sx
                                      ? { sx: reviewStatusMap.pending.sx }
                                      : { color: reviewStatusMap.pending.color }))}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Typography variant="body2">{form.formType}</Typography>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Typography variant="body2">{form._v}</Typography>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Typography variant="body2">{form.createdBy?._id || form.createdBy || 'Unknown'}</Typography>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                <Typography variant="body2">
                                  {reviewRequest?.requestedOn 
                                    ? new Date(reviewRequest.requestedOn).toLocaleDateString()
                                    : 'N/A'
                                  }
                                </Typography>
                              </TableCell>
                              <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton 
                                    size="medium" 
                                    onClick={() => handleViewReview(form)}
                                    sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' } }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </>
                  )}
                </>
              ) : (
                // Completed Reviews
                <>
                  {items.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ border: '1px solid #E0E0E0' }}>No completed reviews</TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Title</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Result</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Comment</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700 }}>Submitted On</TableCell>
                          <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 700, textAlign: 'left' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items
                          .filter(form => {
                            return form.myLatestResult && form.myLatestResult.result !== undefined
                          })
                          .map((form) => {
                            const latestResult = form.myLatestResult

                            return (
                              <TableRow key={form._id} hover>
                                <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                  <Typography fontWeight={500}>{form.title}</Typography>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                  <Chip
                                    icon={latestResult.result === '1' ? <ApprovedIcon /> : <ReworkIcon />}
                                    label={latestResult.result === '1' ? 'Approved' : 'Requested for change'}
                                    {...(latestResult.result === '1'
                                      ? { color: 'success' }
                                      : { sx: { backgroundColor: '#FF8A80', color: 'white' } })}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                  <Typography variant="body2">{latestResult.comment || 'No comment'}</Typography>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                                  <Typography variant="body2">
                                    {latestResult.submittedOn
                                      ? new Date(latestResult.submittedOn).toLocaleString()
                                      : 'N/A'
                                    }
                                  </Typography>
                                </TableCell>
                                <TableCell align="left" sx={{ border: '1px solid #E0E0E0' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                      size="medium" 
                                      onClick={() => handleViewReview(form)}
                                      sx={{ color: '#2196F3', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.08)' } }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </>
                  )}
                </>
              )}
            </Table>
          </TableContainer>

          {/* Bottom status bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {pagination.total > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, pagination.total)} of {pagination.total} entries
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1 }}>
              <Button
                size="small"
                onClick={() => handleChangePage(null, 0)}
                disabled={page === 0}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                First
              </Button>
              <Button
                size="small"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'center' }}>{page + 1}</Typography>
              <Button
                size="small"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={(page + 1) * rowsPerPage >= pagination.total}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Next
              </Button>
              <Button
                size="small"
                onClick={() => handleChangePage(null, Math.ceil(pagination.total / rowsPerPage) - 1)}
                disabled={(page + 1) * rowsPerPage >= pagination.total}
                sx={{ '&:hover:not(:disabled)': { backgroundColor: 'rgba(0, 0, 0, 0.08)' } }}
              >
                Last
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default MyReviews