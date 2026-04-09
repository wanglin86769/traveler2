import { Box, Button } from '@mui/material';
import {
  PlayArrow as StartIcon,
  Pause as FreezeIcon,
  CheckCircle as CompleteIcon,
  ThumbUp as ApproveIcon,
  Refresh as MoreWorkIcon,
  Download as DownloadIcon,
  Input as InputIcon
} from '@mui/icons-material';

const TravelerStatusControls = ({ currentStatus, onStatusChange, travelerId, readOnly = false }) => {
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

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      {currentStatus === 0 && !readOnly && (
        <Button size="small" variant="contained" startIcon={<StartIcon />} onClick={() => onStatusChange(1)} color="primary">
          Start
        </Button>
      )}
      {currentStatus === 1 && !readOnly && (
        <>
          <Button size="small" variant="contained" startIcon={<FreezeIcon />} onClick={() => onStatusChange(3)} color="warning">
            Freeze
          </Button>
          <Button size="small" variant="contained" startIcon={<CompleteIcon />} onClick={() => onStatusChange(1.5)} color="primary">
            Complete
          </Button>
        </>
      )}
      {currentStatus === 1.5 && !readOnly && (
        <>
          <Button size="small" variant="contained" startIcon={<ApproveIcon />} onClick={() => onStatusChange(2)} color="success">
            Approve
          </Button>
          <Button size="small" variant="contained" startIcon={<MoreWorkIcon />} onClick={() => onStatusChange(1)} color="warning">
            More Work
          </Button>
        </>
      )}
      {currentStatus === 2 && !readOnly && (
        <>
          <Button size="small" variant="contained" startIcon={<MoreWorkIcon />} onClick={() => onStatusChange(1)} color="warning">
            More Work
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => window.open(`/travelers/${travelerId}/print`, '_blank')}
            color="primary"
          >
            PDF
          </Button>
        </>
      )}
      {currentStatus === 3 && !readOnly && (
        <Button size="small" variant="contained" startIcon={<InputIcon />} onClick={() => onStatusChange(1)} color="primary">
          Resume
        </Button>
      )}
      {readOnly && <Box sx={{ typography: 'body2', color: 'text.secondary' }}>Status: {getStatusInfo(currentStatus).label}</Box>}
    </Box>
  );
};

export default TravelerStatusControls;