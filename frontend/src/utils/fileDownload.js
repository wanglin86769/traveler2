import api from '@/services/api';

/**
 * Download Traveler Data file
 * @param {string} travelerId - Traveler ID
 * @param {string} dataId - _id of TravelerData record
 * @param {string} filename - Filename for download
 */
export const downloadTravelerDataFile = async (travelerId, dataId, filename) => {
  try {
    const response = await api.get(`/travelers/${travelerId}/data/${dataId}`, {
      responseType: 'blob',
    });

    // Get file type
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    // Create Blob
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });

    // Create Blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release Blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Download Discrepancy Log file
 * @param {string} travelerId - Traveler ID
 * @param {string} logId - _id of Log record
 * @param {string} recordId - _id of Record record
 * @param {string} filename - Filename for download
 */
export const downloadDiscrepancyLogFile = async (travelerId, logId, recordId, filename) => {
  try {
    const response = await api.get(`/travelers/${travelerId}/logs/${logId}/records/${recordId}`, {
      responseType: 'blob',
    });

    // Get file type
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    // Create Blob
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });

    // Create Blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release Blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Preview file in new tab (for images, etc.)
 * @param {string} travelerId - Traveler ID
 * @param {string} dataId - _id of TravelerData record
 */
export const previewTravelerDataFile = async (travelerId, dataId) => {
  try {
    const response = await api.get(`/travelers/${travelerId}/data/${dataId}`, {
      responseType: 'blob',
    });

    // Get file type
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    // Create Blob
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });

    // Create Blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Open in new tab
    window.open(blobUrl, '_blank');

    // Release Blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 5000);

  } catch (error) {
    console.error('Preview failed:', error);
    throw error;
  }
};