/**
 * Form helper utilities
 * Contains all helper functions for form elements and options
 */

// ==================== Element Type Helper Functions ====================

/**
 * Get padding left based on element type
 * @param {string} type - Element type
 * @returns {string} Padding value
 */
export const getPaddingLeftForType = (type) => {
  switch (type) {
    case 'section':
      return '0px'
    case 'instruction':
      return '0px'
    default:
      return '10px'
  }
}

// ==================== Option Processing Helper Functions ====================

/**
 * Handle checkbox-set value change
 * @param {any[]} currentValues - Current value array
 * @param {any} optionValue - Option value
 * @param {boolean} checked - Whether checked
 * @returns {any[]} New value array
 */
export const handleCheckboxSetValueChange = (currentValues, optionValue, checked) => {
  const values = currentValues || []
  if (checked) {
    return [...values, optionValue]
  } else {
    return values.filter(v => v !== optionValue)
  }
}

/**
 * Check if checkbox option is checked
 * @param {any[]} currentValues - Current value array
 * @param {any} optionValue - Option value
 * @returns {boolean}
 */
export const isCheckboxOptionChecked = (currentValues, optionValue) => {
  return (currentValues || []).includes(optionValue)
}

/**
 * Get the currently selected option label
 * @param {any[]} options - Options array
 * @param {any} currentValue - Current value
 * @returns {string}
 */
export const getSelectedOptionLabel = (options, currentValue) => {
  if (!options || !Array.isArray(options)) {
    return currentValue || ''
  }

  const selected = options.find(opt => opt === currentValue)
  return selected || currentValue || ''
}

/**
 * Render options list text for tooltip
 * @param {any[]} options - Options array
 * @param {any} currentValue - Current value
 * @returns {string}
 */
export const renderOptionsTooltip = (options, currentValue) => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return 'No options available'
  }

  return `Available options:\n${options.map((opt, idx) => {
    const isSelected = opt === currentValue
    return `${isSelected ? '✓ ' : '  '}${idx + 1}. ${opt}`
  }).join('\n')}`
}

/**
 * Check if options exist
 * @param {any[]} options - Options array
 * @returns {boolean}
 */
export const hasOptions = (options) => {
  return options && Array.isArray(options) && options.length > 0
}