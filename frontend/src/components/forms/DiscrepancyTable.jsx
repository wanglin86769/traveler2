import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  Typography
} from '@mui/material'

function DiscrepancyTable({ forms, selectedForm, onFormSelect }) {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const getReleasedOn = (form) => {
    // Try multiple possible field names
    if (form.releasedOn) return form.releasedOn
    if (form.released_on) return form.released_on
    if (form.createdAt) return form.createdAt
    if (form.createdOn) return form.createdOn
    return null
  }

  const getReleasedByName = (form) => {
    // Try multiple possible field names
    if (form.releasedBy?.name) return form.releasedBy.name
    if (form.releasedBy && typeof form.releasedBy === 'string') return form.releasedBy
    if (form.released_by) return form.released_by
    // Try createdBy as fallback
    if (form.createdBy?.name) return form.createdBy.name
    if (form.createdBy && typeof form.createdBy === 'string') return form.createdBy
    // Try updatedBy
    if (form.updatedBy?.name) return form.updatedBy.name
    if (form.updatedBy && typeof form.updatedBy === 'string') return form.updatedBy
    return 'Unknown'
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Title</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Released On</TableCell>
            <TableCell>Released By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form) => (
            <TableRow
              key={form._id}
              hover
              selected={selectedForm?._id === form._id}
              onClick={() => onFormSelect(form)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell padding="checkbox">
                <Radio
                  checked={selectedForm?._id === form._id}
                  onChange={() => onFormSelect(form)}
                  value={form._id}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {form.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {form.ver || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(getReleasedOn(form))}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {getReleasedByName(form)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          {forms.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  No discrepancy forms available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DiscrepancyTable