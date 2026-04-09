import { Box, IconButton, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const NoteItem = ({ note, onEdit, onDelete, readOnly = false }) => {
  return (
    <Box
      sx={{
        p: 1,
        bgcolor: '#FFFDE7',
        borderRadius: 1,
        border: '1px solid #FFF9C4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#5D4037', fontWeight: 500 }}>
          {note.inputBy || 'unknown'} created on {new Date(note.inputOn).toLocaleString()}
          {note.updatedOn && note.updatedOn !== note.inputOn && `, updated on ${new Date(note.updatedOn).toLocaleString()}`}
          {note.updatedBy && ` by ${note.updatedBy}`}:
        </Typography>
        <Typography variant="caption" sx={{ color: '#5D4037', display: 'block', mt: 0.5 }}>
          {note.value}
        </Typography>
      </Box>
      {!readOnly && (
        <Box sx={{ display: 'flex', gap: 0.5, alignSelf: 'flex-start' }}>
          {/* Edit button */}
          <IconButton size="small" onClick={() => onEdit(note)} sx={{ p: 0.5 }}>
            <EditIcon fontSize="medium" sx={{ color: '#1976D2' }} />
          </IconButton>
          {/* Delete button */}
          <IconButton size="small" onClick={() => onDelete(note)} sx={{ p: 0.5 }}>
            <DeleteIcon fontSize="medium" sx={{ color: '#d32f2f' }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default NoteItem;