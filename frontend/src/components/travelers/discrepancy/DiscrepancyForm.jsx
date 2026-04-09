import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import DiscrepancyLogs from './DiscrepancyLogs';
import DiscrepancyDialog from './DiscrepancyDialog';

const DiscrepancyForm = ({ discrepancyFormFields = [], discrepancyLogs = [], onSubmit, travelerId, readOnly = false }) => {
  const [discrepancyDialogOpen, setDiscrepancyDialogOpen] = useState(false);
  const [discrepancyFormData, setDiscrepancyFormData] = useState({});

  const handleOpenDiscrepancyDialog = () => {
    setDiscrepancyFormData({ ...discrepancyFormData, travelerId });
    setDiscrepancyDialogOpen(true);
  };

  const handleCloseDiscrepancyDialog = () => {
    setDiscrepancyDialogOpen(false);
    // Reset form data after closing
    setDiscrepancyFormData({});
  };

  const handleSubmitDiscrepancy = () => {
    // Create FormData for file and text upload
    const formData = new FormData();
    // Add all fields to FormData
    discrepancyFormFields.forEach((field) => {
      const value = discrepancyFormData[field.name];
      // Skip empty values
      if (value === undefined || value === null) {
        return;
      }
      // File fields must be File objects
      if (field.type === 'file' && !(value instanceof File)) {
        return;
      }
      formData.append(field.name, value);
    });
    // Submit FormData
    onSubmit(formData, handleCloseDiscrepancyDialog);
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
          Discrepancy log
        </Typography>
      </Box>
      <DiscrepancyLogs
        discrepancyFormFields={discrepancyFormFields}
        discrepancyLogs={discrepancyLogs}
        onAddDiscrepancy={handleOpenDiscrepancyDialog}
        travelerId={travelerId}
        readOnly={readOnly}
      />
      <DiscrepancyDialog
        open={discrepancyDialogOpen}
        onClose={handleCloseDiscrepancyDialog}
        onSubmit={handleSubmitDiscrepancy}
        discrepancyFormFields={discrepancyFormFields}
        discrepancyFormData={discrepancyFormData}
        onFormDataChange={setDiscrepancyFormData}
        isSubmitting={false}
      />
    </>
  );
};

export default DiscrepancyForm;