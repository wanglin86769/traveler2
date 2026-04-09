/**
 * Input control styles definition
 */

/**
 * Input control width configuration
 * Different control types have different optimal widths
 */
export const inputControlWidths = {
  text: '300px',
  dropdown: '300px',
  file: '300px'
}

/**
 * Text input field styles
 */
export const textFieldStyles = {
  width: inputControlWidths.text,
  minWidth: inputControlWidths.text,
  maxWidth: inputControlWidths.text,
  '& .MuiInputBase-input': {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: '#F5F5F5',
    border: 'none',
    borderRadius: '8px',
    '&:focus': {
      outline: 'none',
      borderColor: '#2196F3',
      boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)'
    }
  },
  '& .Mui-disabled': {
    backgroundColor: '#FAFAFA',
    color: '#999',
    cursor: 'not-allowed'
  }
}

/**
 * Number input field styles
 */
export const numberFieldStyles = {
  ...textFieldStyles
}

/**
 * Select dropdown styles
 */
export const selectStyles = {
  width: inputControlWidths.dropdown,
  minWidth: inputControlWidths.dropdown,
  maxWidth: inputControlWidths.dropdown,
  '& .MuiSelect-select': {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: '#F5F5F5',
    border: 'none',
    borderRadius: '8px',
    '&:focus': {
      outline: 'none',
      borderColor: '#2196F3',
      boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)'
    }
  }
}

/**
 * Checkbox/Radio button styles
 */
export const checkboxRadioStyles = {
  
}

/**
 * Checkbox/Radio label styles
 */
export const checkboxRadioLabelStyles = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  '&.Mui-disabled': {
    cursor: 'not-allowed'
  }
}

/**
 * Textarea styles
 */
export const textareaStyles = {
  width: inputControlWidths.text,
  minWidth: inputControlWidths.text,
  maxWidth: inputControlWidths.text,
  '& .MuiInputBase-root': {
    backgroundColor: '#F5F5F5',
  },
  '& .MuiInputBase-multiline': {
    padding: '8px 12px'
  },
  '& .Mui-disabled': {
    backgroundColor: '#FAFAFA',
    color: '#999',
    cursor: 'not-allowed'
  }
}

/**
 * Date picker styles
 */
export const datePickerStyles = {
  ...textFieldStyles
}

/**
 * File input styles
 */
export const fileInputStyles = {
  width: '100%'
}