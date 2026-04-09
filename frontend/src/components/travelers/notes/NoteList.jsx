import { useState } from 'react';
import { Box, Collapse, IconButton, Typography } from '@mui/material';
import { Description as NotesIcon } from '@mui/icons-material';
import NoteItem from './NoteItem';
import NoteDialog from './NoteDialog';

const NoteList = ({
  notes = [],
  showNotesContent = false,
  showNotesBadge = true,
  onNotesToggle,
  onNoteSubmit,
  onNoteUpdate,
  onNoteDelete,
  readOnly = false
}) => {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteValue('');
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteValue(note.value);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = (note) => {
    onNoteDelete(note._id || note.id);
  };

  const handleNoteSubmit = () => {
    if (noteValue.trim()) {
      if (editingNote) {
        onNoteUpdate(editingNote, noteValue);
      } else {
        onNoteSubmit(noteValue);
      }
      setNoteValue('');
      setEditingNote(null);
      setNoteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ mt: 1, ml: '230px' }}>
      {/* 200px(label) + 20px(gap) + 10px(padding) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Click document icon to add note */}
        {!readOnly && (
          <IconButton size="small" onClick={handleAddNote}>
            <NotesIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </IconButton>
        )}
        {/* Notes text */}
        <Typography variant="caption" color="text.secondary">
          notes:
        </Typography>
        {/* Click count badge to toggle notes display for current field only */}
        {showNotesBadge && (
          <Box
            onClick={onNotesToggle}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#E3F2FD',
              color: '#1976D2',
              fontSize: '12px',
              fontWeight: 600,
              px: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#BBDEFB'
              }
            }}
          >
            {notes.length}
          </Box>
        )}
      </Box>

      {/* Notes items - controlled by both global toggle and individual field toggle */}
      <Collapse in={showNotesContent}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {notes.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No notes yet
            </Typography>
          ) : (
            notes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                readOnly={readOnly}
              />
            ))
          )}
        </Box>
      </Collapse>

      {/* Note dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        onSubmit={handleNoteSubmit}
        editingNote={editingNote}
        noteValue={noteValue}
        onNoteValueChange={(e) => setNoteValue(e.target.value)}
      />
    </Box>
  );
};

export default NoteList;