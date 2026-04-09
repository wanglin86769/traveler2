import { useState, useRef, useEffect } from 'react'

/**
 * Hook for managing form section navigation
 * Provides section registration, intersection observation, and scroll functionality
 * @param {Object} config - Configuration object
 * @param {HTMLElement} config.rootElement - Root element for intersection observer
 * @returns {Object} Navigation functions and state
 */
export const useFormSectionNavigation = ({ rootElement }) => {
  const [activeSection, setActiveSection] = useState(null)
  const [registeredSections, setRegisteredSections] = useState(new Set())
  const sectionRefs = useRef({})
  const observersRef = useRef({})

  /**
   * Register a section element for navigation
   * @param {string} sectionId - Unique identifier for the section
   * @param {HTMLElement} element - DOM element of the section
   */
  const handleSectionRegister = (sectionId, element) => {
    if (!registeredSections.has(sectionId)) {
      setRegisteredSections(prev => new Set([...prev, sectionId]))
      sectionRefs.current[sectionId] = element
      
      // Add Intersection Observer for newly registered Section
      // Exact configuration from FormPreview.jsx
      const observerOptions = {
        root: rootElement || null,
        rootMargin: '-10% 0px -60% 0px',
        threshold: 0.1
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      }, observerOptions)

      observer.observe(element)
      
      // Save observer reference for cleanup
      observersRef.current[sectionId] = observer
    }
  }

  /**
   * Scroll to specified section
   * @param {string} sectionId - Section identifier to scroll to
   */
  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      // Highlight immediately
      setActiveSection(sectionId)
      
      // Get current position of element
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      
      // Scroll to Section position, subtract top fixed bar height (80px)
      // Exact configuration from FormPreview.jsx
      window.scrollTo({
        top: absoluteElementTop - 80,
        behavior: 'smooth'
      })
    }
  }

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      Object.values(observersRef.current).forEach(observer => {
        observer.disconnect()
      })
    }
  }, [])

  return {
    activeSection,
    handleSectionRegister,
    scrollToSection
  }
}