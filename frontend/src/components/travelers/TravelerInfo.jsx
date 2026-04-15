import { Box, Typography, Chip, Paper } from '@mui/material';

const TravelerInfo = ({ traveler }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { label: 'Draft', color: 'default' },
      1: { label: 'In Progress', color: 'primary' },
      1.5: { label: 'Submitted', color: 'warning' },
      2: { label: 'Completed', color: 'success' },
      3: { label: 'Paused', color: 'info' },
      4: { label: 'Archived', color: 'error' }
    };
    return statusMap[status] || { label: 'Unknown', color: 'default' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!traveler) return null;

  const statusInfo = getStatusInfo(traveler.status);

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            Title:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {traveler.title || 'Untitled'}
          </Typography>
          <Chip 
            label={statusInfo.label} 
            size="small" 
            color={statusInfo.color}
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Created:
            </Typography>
            <Typography variant="body2">
              {formatDate(traveler.created || traveler.createdOn)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Updated:
            </Typography>
            <Typography variant="body2">
              {formatDate(traveler.updated || traveler.updatedOn)}
            </Typography>
          </Box>
          
          {traveler.deadline && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Deadline:
              </Typography>
              <Typography variant="body2">
                {formatDate(traveler.deadline)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default TravelerInfo;