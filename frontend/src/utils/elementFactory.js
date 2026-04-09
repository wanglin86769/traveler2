/**
 * Element Factory Class
 * Used to create instances of various types of form elements
 */

import { FORM_ELEMENT_DEFINITIONS } from '@/components/forms/elements/elementDefinitions';
import UID from './uid';

/**
 * Element Factory Class
 */
export class ElementFactory {
  /**
   * Create an element instance
   * @param {string} type - Element type
   * @param {Object} overrides - Properties to override
   * @returns {Object} Element instance
   */
  static create(type, overrides = {}) {
    const definition = FORM_ELEMENT_DEFINITIONS.find(d => d.type === type);
    if (!definition) {
      throw new Error(`Unknown element type: ${type}`);
    }

    // Deep copy schema (contains all default values)
    const element = JSON.parse(JSON.stringify(definition.schema));

    // Generate name (all elements have this, used for drag-and-drop sorting)
    element.name = overrides.name || UID.generateShort();

    // Section elements additionally generate id (used for sidebar navigation)
    if (type === 'section') {
      element.id = UID.generateShort();
    }

    // Override user-provided properties
    Object.keys(overrides).forEach(key => {
      if (overrides[key] !== undefined) {
        element[key] = overrides[key];
      }
    });

    return element;
  }

  /**
   * Batch create elements
   * @param {Array} configs - Array of element configurations [{type, ...props}]
   * @returns {Array} Array of element instances
   */
  static createMany(configs) {
    return configs.map(config => this.create(config.type, config));
  }

  /**
   * Check if it's a valid element type
   * @param {string} type - Element type
   * @returns {boolean} Whether it's valid
   */
  static isValidType(type) {
    return FORM_ELEMENT_DEFINITIONS.some(d => d.type === type);
  }

  /**
   * Get all available element types
   * @returns {Array} Array of element types
   */
  static getAvailableTypes() {
    return FORM_ELEMENT_DEFINITIONS.map(d => d.type);
  }

  /**
   * Clone an element
   * @param {Object} element - Original element
   * @returns {Object} New element
   */
  static clone(element) {
    const newElement = this.create(element.type);
    Object.keys(element).forEach(key => {
      if (key !== 'id' && key !== 'name') {
        newElement[key] = element[key];
      }
    });

    // Regenerate name (all elements)
    newElement.name = UID.generateShort();

    // Section elements regenerate id
    if (element.type === 'section') {
      newElement.id = UID.generateShort();
    }

    return newElement;
  }
}

export default ElementFactory;