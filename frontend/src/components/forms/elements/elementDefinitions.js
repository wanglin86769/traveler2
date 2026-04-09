/**
 * Form Element Types and Definitions
 *
 * This file defines all available form element types and their default schemas.
 * Form elements are organized into three categories:
 * - Basic Inputs: checkbox, radio, text, number, file, dropdown, etc.
 * - Other Types: date, datetime, time, email, phone, url
 * - Structural Elements: section, instruction
 *
 * Each element definition includes:
 * - type: The unique identifier for the element type
 * - displayName: Human-readable name for UI display
 * - icon: Material Design icon name
 * - schema: Default structure and properties for the element
 */

export const FORM_ELEMENT_TYPES = {
  // Basic Inputs
  CHECKBOX: 'checkbox',
  CHECKBOX_SET: 'checkbox-set',
  RADIO: 'radio',
  TEXT: 'text',
  FIGURE: 'figure',
  PARAGRAPH: 'paragraph',
  NUMBER: 'number',
  FILE: 'file',
  DROPDOWN: 'dropdown',

  // Other Types
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',

  // Structural Elements
  SECTION: 'section',
  INSTRUCTION: 'instruction'
}

// Form element definitions with metadata
export const FORM_ELEMENT_DEFINITIONS = [
  // Basic Inputs
  {
    type: FORM_ELEMENT_TYPES.CHECKBOX,
    displayName: 'Checkbox',
    icon: 'CheckBox',
    schema: {
      type: FORM_ELEMENT_TYPES.CHECKBOX,
      name: '',
      number: '',
      label: 'Checkbox Field',
      text: 'checkbox text',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.CHECKBOX_SET,
    displayName: 'Checkbox set',
    icon: 'CheckBox',
    schema: {
      type: FORM_ELEMENT_TYPES.CHECKBOX_SET,
      name: '',
      number: '',
      label: 'Multiple Choice Field',
      helpText: '',
      options: ['Option 1', 'Option 2']
    }
  },
  {
    type: FORM_ELEMENT_TYPES.RADIO,
    displayName: 'Radio',
    icon: 'RadioButtonChecked',
    schema: {
      type: FORM_ELEMENT_TYPES.RADIO,
      name: '',
      number: '',
      label: 'Radio Field',
      required: false,
      helpText: '',
      options: ['Option 1', 'Option 2']
    }
  },
  {
    type: FORM_ELEMENT_TYPES.TEXT,
    displayName: 'Text',
    icon: 'TextFields',
    schema: {
      type: FORM_ELEMENT_TYPES.TEXT,
      name: '',
      number: '',
      label: 'Text Field',
      placeholder: '',
      required: false,
      helpText: ''
    }
  },
  {
    type: FORM_ELEMENT_TYPES.FIGURE,
    displayName: 'Figure',
    icon: 'Image',
    schema: {
      type: FORM_ELEMENT_TYPES.FIGURE,
      name: '',
      number: '',
      alt: 'Alt text',
      figcaption: 'Figure caption',
      width: '',
      filename: '',
      size: 0,
      src: ''
    }
  },
  {
    type: FORM_ELEMENT_TYPES.PARAGRAPH,
    displayName: 'Paragraph',
    icon: 'ViewHeadline',
    schema: {
      type: 'paragraph',
      name: '',
      number: '',
      label: 'Paragraph Field',
      placeholder: '',
      rows: 3,
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.NUMBER,
    displayName: 'Number',
    icon: 'Numbers',
    schema: {
      type: FORM_ELEMENT_TYPES.NUMBER,
      name: '',
      number: '',
      label: 'Number Field',
      placeholder: '',
      helpText: '',
      min: '',
      max: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.FILE,
    displayName: 'Upload file',
    icon: 'AttachFile',
    schema: {
      type: FORM_ELEMENT_TYPES.FILE,
      name: '',
      number: '',
      label: 'File Upload Field',
      filetype: '',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.DROPDOWN,
    displayName: 'Dropdown',
    icon: 'ArrowDropDownCircle',
    schema: {
      type: 'dropdown',
      name: '',
      number: '',
      label: 'Dropdown Field',
      required: false,
      helpText: '',
      options: ['Option 1', 'Option 2']
    }
  },

  // Other Types
  {
    type: FORM_ELEMENT_TYPES.DATE,
    displayName: 'Date',
    icon: 'CalendarToday',
    schema: {
      type: FORM_ELEMENT_TYPES.DATE,
      name: '',
      number: '',
      label: 'Date Field',
      placeholder: '',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.DATETIME,
    displayName: 'Date Time',
    icon: 'Schedule',
    schema: {
      type: FORM_ELEMENT_TYPES.DATETIME,
      name: '',
      number: '',
      label: 'Date Time Field',
      placeholder: '',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.TIME,
    displayName: 'Time',
    icon: 'Schedule',
    schema: {
      type: FORM_ELEMENT_TYPES.TIME,
      name: '',
      number: '',
      label: 'Time Field',
      placeholder: '',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.EMAIL,
    displayName: 'Email',
    icon: 'Email',
    schema: {
      type: FORM_ELEMENT_TYPES.EMAIL,
      name: '',
      number: '',
      label: 'Email Field',
      placeholder: 'user@example.com',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.PHONE,
    displayName: 'Phone number',
    icon: 'Phone',
    schema: {
      type: FORM_ELEMENT_TYPES.PHONE,
      name: '',
      number: '',
      label: 'Phone Field',
      placeholder: '(123) 456-7890',
      helpText: '',
      required: false
    }
  },
  {
    type: FORM_ELEMENT_TYPES.URL,
    displayName: 'URL',
    icon: 'Link',
    schema: {
      type: FORM_ELEMENT_TYPES.URL,
      name: '',
      number: '',
      label: 'URL Field',
      placeholder: 'https://example.com',
      helpText: '',
      required: false
    }
  },

  // Structural Elements
  {
    type: FORM_ELEMENT_TYPES.SECTION,
    displayName: 'Section',
    icon: 'ViewModule',
    schema: {
      type: FORM_ELEMENT_TYPES.SECTION,
      id: '',                // Used for sidebar navigation
      name: '',              // Used for drag-and-drop sorting
      number: '',
      legend: 'Section legend'
    }
  },
  {
    type: FORM_ELEMENT_TYPES.INSTRUCTION,
    displayName: 'Rich instruction',
    icon: 'EditNote',
    schema: {
      type: FORM_ELEMENT_TYPES.INSTRUCTION,
      name: '',
      number: '',
      content: ''
    }
  }
]