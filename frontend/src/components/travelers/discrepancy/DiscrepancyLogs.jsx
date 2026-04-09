import { Box, Paper, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Avatar, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer';
import { downloadDiscrepancyLogFile } from '@/utils/fileDownload';

const DiscrepancyLogs = ({
  discrepancyFormFields = [],
  discrepancyLogs = [],
  onAddDiscrepancy,
  travelerId,
  readOnly = false
}) => {
  return (
    <Box id="discrepancy-section">
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sequence</TableCell>
                {discrepancyFormFields.map((field) => (
                  <TableCell key={field.name}>{field.label || field.name}</TableCell>
                ))}
                <TableCell>Documented by</TableCell>
                <TableCell>On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discrepancyLogs.length > 0 ? (
                discrepancyLogs.map((log, index) => (
                  <TableRow key={log._id}>
                    <TableCell>{index + 1}</TableCell>
                    {discrepancyFormFields.map((field) => {
                      const record = log.records?.find((r) => r.name === field.name);
                      if (!record || record.value === undefined || record.value === '') {
                        return <TableCell key={field.name}>-</TableCell>;
                      }
                      // Check if it's a file field (has file object)
                      const isFile = record.file && record.file.path;
                      if (isFile) {
                        // File field: display as clickable download link
                        return (
                          <TableCell key={field.name}>
                            <Box
                              onClick={() => downloadDiscrepancyLogFile(travelerId, log._id, record._id, record.value || 'download')}
                              sx={{
                                color: '#1976D2',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                '&:hover': {
                                  color: '#1565C0',
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {record.value}
                            </Box>
                          </TableCell>
                        );
                      } else {
                        // Text field: display normally
                        return <TableCell key={field.name}>{record.value}</TableCell>;
                      }
                    })}
                    <TableCell>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#D1D5DB' }}>
                        {log.documentedBy?.charAt(0) || 'W'}
                      </Avatar>
                    </TableCell>
                    <TableCell>{log.inputOn ? formatDistanceToNow(new Date(log.inputOn)) : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={discrepancyFormFields.length + 3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No data available in table
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!readOnly && (
          <Box sx={{ p: 2 }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAddDiscrepancy}>
              Add discrepancy log
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DiscrepancyLogs;