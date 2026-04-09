/**
 * UID utility - Uses modern browser API
 * Implemented with crypto.randomUUID(), no additional dependencies required
 */

export const UID = {
  /**
   * Generate a complete UUID v4
   * Uses modern browser native API for optimal performance
   * @returns {string} UUID v4 string, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   */
  generate() {
    return crypto.randomUUID();
  },

  /**
   * Generate a short UID (8-digit hexadecimal)
   * Extracted from the first 8 characters of the complete UUID
   * @returns {string} 8-digit hexadecimal string, e.g., "a3f7b2c9"
   */
  generateShort() {
    return crypto.randomUUID().substring(0, 8);
  }
};

export default UID;