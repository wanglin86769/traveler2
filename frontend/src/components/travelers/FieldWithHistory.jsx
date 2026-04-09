import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button } from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as ResetIcon,
  CloudUpload as UploadIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer';
import FieldHistory from './FieldHistory';
import NoteList from './notes/NoteList';
import { downloadTravelerDataFile } from '@/utils/fileDownload';

const FieldWithHistory = ({
  element,
  value,
  onChange,
  onSave,
  onReset,
  onNotesToggle,
  showNotes,
  onNoteSubmit,
  onNoteUpdate,
  onNoteDelete,
  notes = [],
  history = [],
  saving,
  showHistoryGlobal,
  showNotesContentGlobal,
  travelerId,
  readOnly = false
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [hasSelectedFile, setHasSelectedFile] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const fileUploadRef = useRef(null);
  const queryClient = useQueryClient();

  // Update localValue when value prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Handle value change
  const handleChange = (name, newValue) => {
    if (newValue instanceof File) {
      setHasSelectedFile(true);
      return;
    }
    
    if (newValue === null || newValue === '') {
      setHasSelectedFile(false);
      return;
    }
    
    // For other types, update local value
    setLocalValue(newValue);
  };

  const handleSave = () => {
    if (element.type === 'file') {
      return;
    }
    onSave(element.name, localValue, element.type);
  };

  const handleReset = () => {
    onReset?.(element.name);
    setLocalValue(value || '');
  };

  const handleFileUpload = async () => {
    if (!fileUploadRef.current) {
      return;
    }
    setFileUploading(true);
    
    try {
      const result = await fileUploadRef.current.handleUpload();
      if (result?.success) {
        // After successful upload, reset file selection state
        setHasSelectedFile(false);
        // Refresh data
        queryClient.invalidateQueries(['travelerData', travelerId]);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setFileUploading(false);
    }
  };

  const handleFileCancel = () => {
    setHasSelectedFile(false);
    if (fileUploadRef.current) {
      fileUploadRef.current.handleCancel();
    }
  };

  const handleFileDownload = () => {
        if (value?._id && travelerId) {
          downloadTravelerDataFile(travelerId, value._id, value.file?.originalname || value.value || 'download');
        }
      };
  return (
    <Box sx={{ mb: 2 }}>
      {/* Outer container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          borderRadius: 1,
          bgcolor: 'transparent',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            bgcolor: '#E3F2FD'
          }
        }}
      >
        {/* Content area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          {/* Form element */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              position: 'relative'
            }}
          >
            <InputFieldRenderer
              element={element}
              value={localValue}
              onChange={handleChange}
              disabled={saving || readOnly}
              mode="fill"
              travelerId={travelerId}
              fileUploadRef={fileUploadRef}
              readOnly={readOnly}
            />

            {/* Button group */}
            {!readOnly && element.type !== 'section' && element.type !== 'instruction' && element.type !== 'figure' && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 0.5,
                  minWidth: '180px',
                  justifyContent: 'flex-end'
                }}
              >
                {element.type === 'file' ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleFileUpload}
                      disabled={fileUploading || !hasSelectedFile}
                      startIcon={<UploadIcon />}
                      sx={{
                        bgcolor: '#2196F3',
                        '&:hover': { bgcolor: '#1976D2' },
                        '&:disabled': { bgcolor: '#ccc' },
                        padding: '6px 12px',
                        fontSize: '13px',
                        minHeight: '28px',
                        minWidth: '80px'
                      }}
                    >
                      {fileUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleFileCancel}
                      disabled={fileUploading || !hasSelectedFile}
                      startIcon={<CancelIcon />}
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#757575',
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          bgcolor: '#f5f5f5'
                        },
                        '&:disabled': {
                          borderColor: '#e0e0e0',
                          color: '#bdbdbd'
                        },
                        padding: '6px 12px',
                        fontSize: '13px',
                        minHeight: '28px',
                        minWidth: '80px'
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving || localValue === value}
                      startIcon={<SaveIcon />}
                      sx={{
                        bgcolor: '#2196F3',
                        '&:hover': { bgcolor: '#1976D2' },
                        '&:disabled': { bgcolor: '#ccc' },
                        padding: '6px 12px',
                        fontSize: '13px',
                        minHeight: '28px',
                        minWidth: '80px'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleReset}
                      disabled={saving || localValue === value}
                      startIcon={<ResetIcon />}
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#757575',
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          bgcolor: '#f5f5f5'
                        },
                        '&:disabled': {
                          borderColor: '#e0e0e0',
                          color: '#bdbdbd'
                        },
                        padding: '6px 12px',
                        fontSize: '13px',
                        minHeight: '28px',
                        minWidth: '80px'
                      }}
                    >
                      Reset
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* History section */}
        <FieldHistory history={history} showHistory={showHistoryGlobal} travelerId={travelerId} />

        {/* Notes section */}
        {!readOnly && (
          <NoteList
            notes={notes}
            showNotesContent={showNotesContentGlobal && showNotes}
            onNotesToggle={() => onNotesToggle?.(element.name)}
            onNoteSubmit={(noteValue) => onNoteSubmit(element.name, noteValue)}
            onNoteUpdate={(note, noteValue) => onNoteUpdate(note, noteValue)}
            onNoteDelete={(noteId) => onNoteDelete?.(element.name, noteId)}
          />
        )}
      </Box>
    </Box>
  );
};

export default FieldWithHistory;