import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import InputFieldRenderer from '@/components/forms/inputs/InputFieldRenderer';

const DiscrepancyDialog = ({ open, onClose, onSubmit, discrepancyFormFields = [], discrepancyFormData, onFormDataChange, isSubmitting = false }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Please input discrepancy log details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {discrepancyFormFields.map((field) => (
            <Box key={field.name} sx={{ mb: 2 }}>
              <InputFieldRenderer
                element={field}
                value={discrepancyFormData[field.name]}
                onChange={(name, value) => onFormDataChange({ ...discrepancyFormData, [name]: value })}
                mode="discrepancy"
                travelerId={discrepancyFormData.travelerId}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" color="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscrepancyDialog;