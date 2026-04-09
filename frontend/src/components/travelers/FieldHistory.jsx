import { Box, Typography } from '@mui/material';
import { downloadTravelerDataFile } from '@/utils/fileDownload';

const FieldHistory = ({ history = [], showHistory = true, travelerId }) => {
  if (!showHistory || !history || history.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 1, ml: '230px' }}>
      {/* 200px(label) + 20px(gap) + 10px(padding) */}
      <Box>
        {history.map((h, index) => {
          // history records are directly from database
          const historyValue = h.value;
          const historyFile = h.file;
          const inputBy = h.inputBy || 'unknown';
          const inputOn = h.inputOn ? new Date(h.inputOn).toLocaleString() : 'unknown';
          const inputType = h.inputType;

          // Format history value based on input type
          let formattedValue = historyValue;
          let isFile = false;
          let filePath = null;

          if (inputType === 'checkbox') {
            // Checkbox: display as true or false
            if (historyValue === true || historyValue === 'true') {
              formattedValue = 'true';
            } else {
              formattedValue = 'false';
            }
          } else if (inputType === 'checkbox-set') {
            // Checkbox-set: wrap array values in brackets
            if (Array.isArray(historyValue)) {
              formattedValue = `[${historyValue.join(', ')}]`;
            } else if (typeof historyValue === 'string') {
              try {
                const parsed = JSON.parse(historyValue);
                if (Array.isArray(parsed)) {
                  formattedValue = `[${parsed.join(', ')}]`;
                } else {
                  formattedValue = `[${historyValue}]`;
                }
              } catch {
                formattedValue = `[${historyValue}]`;
              }
            } else {
              formattedValue = `[${String(historyValue)}]`;
            }
          } else if (inputType === 'radio') {
            // Radio: wrap value in quotes
            formattedValue = `"${String(historyValue || '')}"`;
          } else if (inputType === 'file') {
            // File type: mark as clickable
            isFile = true;
            formattedValue = String(historyValue !== null && historyValue !== undefined ? historyValue : '');
            // Extract file path from file object if available
            if (historyFile && historyFile.path) {
              filePath = historyFile.path;
            }
          } else {
            // Other types: convert to string
            formattedValue = String(historyValue !== null && historyValue !== undefined ? historyValue : '');
          }

          // Handle file download click
          const handleFileClick = () => {
            if (isFile && h._id && travelerId) {
              downloadTravelerDataFile(travelerId, h._id, h.file?.originalname || h.value || 'download');
            }
          };

          return (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '12px', display: 'block', mb: 0.5 }}
            >
              history: changed to{' '}
              {isFile ? (
                <Box
                  component="span"
                  sx={{
                    color: '#fa8c16',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={handleFileClick}
                >
                  {formattedValue}
                </Box>
              ) : (
                <Box component="span" sx={{ color: '#fa8c16', fontWeight: 600 }}>{formattedValue}</Box>
              )}{' '}
              by {inputBy} {inputOn}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default FieldHistory;