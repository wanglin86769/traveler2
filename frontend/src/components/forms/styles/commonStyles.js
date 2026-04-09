/**
 * Common styles definition
 */

/**
 * Base styles for input fields
 */
export const inputBaseStyles = {
  padding: '0 12px',
  fontSize: '14px',
  backgroundColor: '#F5F5F5',
  border: '1px solid #E0E0E0',
  borderRadius: '4px',
  '&:focus': {
    outline: 'none',
    borderColor: '#2196F3',
    boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)'
  }
}

/**
 * Disabled input field styles
 */
export const disabledInputStyles = {
  backgroundColor: '#FAFAFA',
  color: '#999',
  cursor: 'not-allowed',
  '&:focus': {
    outline: 'none',
    borderColor: '#E0E0E0',
    boxShadow: 'none'
  }
}

/**
 * Readonly input field styles (for populate mode)
 */
export const readonlyInputStyles = {
  backgroundColor: '#F8F9FA',
  color: '#333',
  cursor: 'default',
  '&:focus': {
    outline: 'none',
    borderColor: '#E0E0E0',
    boxShadow: 'none'
  }
}

/**
 * Help text styles
 */
export const helpTextStyles = {
  fontSize: '12px',
  color: '#595959',
  mt: '4px'
}

/**
 * Control number badge styles
 */
export const numberBadgeStyles = (color = '#4CAF50') => ({
  background: color,
  color: 'white',
  padding: '2px 6px',
  margin: '4px 0',
  border: 'double',
  borderColor: 'white',
  borderRadius: '9px',
  fontSize: '14px',
  fontWeight: 700,
  minWidth: '24px',
  height: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
})

/**
 * Required mark styles
 */
export const requiredMarkStyles = {
  color: 'red'
}

/**
 * Field type color constants
 */
export const FIELD_TYPE_COLORS = {
  SECTION: '#FF9800',      // Orange for section
  INSTRUCTION: '#2196F3',   // Blue for instruction
  DEFAULT: '#4CAF50'       // Green for default fields
}

/**
 * Get color by field type
 * @param {string} type - Field type
 * @returns {string} Color hex value
 */
export const getTypeColor = (type) => {
  const colorMap = {
    section: FIELD_TYPE_COLORS.SECTION,
    instruction: FIELD_TYPE_COLORS.INSTRUCTION
  }
  return colorMap[type] || FIELD_TYPE_COLORS.DEFAULT
}