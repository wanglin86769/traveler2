/**
 * Form element numbering utility
 * Implements numbering rules similar to the original traveler:
 * - Section: 1, 2, 3, ...
 * - Instruction: 1.1, 1.2, 2.1, ...
 * - Field: 1.1.1, 1.1.2, 2.1.1, ...
 */

/**
 * Update form element numbering
 * @param {Array} elements - Array of form elements
 * @returns {Array} Updated form element array (with number field)
 */
export const updateSectionNumbers = (elements) => {
  if (!elements || !Array.isArray(elements)) {
    return elements
  }

  let sectionNumber = 0
  let instructionNumber = 0
  let controlNumber = 0

  return elements.map((element) => {
    const type = element.type

    if (type === 'section') {
      sectionNumber += 1
      instructionNumber = 0
      controlNumber = 0
      return {
        ...element,
        number: sectionNumber.toString()
      }
    } else if (type === 'instruction') {
      instructionNumber += 1
      controlNumber = 0
      return {
        ...element,
        number: `${sectionNumber}.${instructionNumber}`
      }
    } else {
      controlNumber += 1
      return {
        ...element,
        number: `${sectionNumber}.${instructionNumber}.${controlNumber}`
      }
    }
  })
}