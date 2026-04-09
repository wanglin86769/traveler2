import { useState, useRef, useMemo, useEffect } from 'react'
import { useFormSectionNavigation } from './useFormSectionNavigation'

/**
 * Custom hook for managing traveler page navigation and section tracking
 * Handles sidebar navigation, section registration, and scroll behavior for traveler forms
 * 
 * @param {Object} currentTraveler - The traveler object containing form and discrepancy information
 * @returns {Object} Navigation state and handlers
 */
export const useTravelerNavigation = (currentTraveler) => {
  // Custom refs for Discrepancy and Traveler containers
  const discrepancyRef = useRef(null)
  const travelerRef = useRef(null)

  // Use form section navigation hook
  const {
    activeSection,
    handleSectionRegister,
    scrollToSection
  } = useFormSectionNavigation({
    rootElement: null
  })

  // Get discrepancy history records
  const hasDiscrepancyForm = useMemo(() => {
    return currentTraveler?.discrepancyForm ||
      (currentTraveler?.discrepancyLogs && currentTraveler.discrepancyLogs.length > 0)
  }, [currentTraveler?.discrepancyForm, currentTraveler?.discrepancyLogs])

  // Build navigation sections for sidebar
  const sections = useMemo(() => {
    const navSections = []
    // 1. Add 'Discrepancy log' (if exists)
    if (hasDiscrepancyForm) {
      navSections.push({
        id: 'discrepancy-section',
        legend: 'Discrepancy log'
      })
    }
    // 2. Add 'Traveler'
    navSections.push({
      id: 'traveler-section',
      legend: 'Traveler'
    })
    // 3. Add sections from form
    if (currentTraveler?.form?.json) {
      currentTraveler.form.json
        .filter(element => element.type === 'section')
        .forEach(section => {
          navSections.push(section)
        })
    }
    return navSections
  }, [currentTraveler, hasDiscrepancyForm])

  // Register Discrepancy and Traveler containers with Intersection Observer
  useEffect(() => {
    if (discrepancyRef.current) {
      handleSectionRegister('discrepancy-section', discrepancyRef.current)
    }
  }, [discrepancyRef.current, handleSectionRegister])

  useEffect(() => {
    if (travelerRef.current) {
      handleSectionRegister('traveler-section', travelerRef.current)
    }
  }, [travelerRef.current, handleSectionRegister])

  // Override scrollToSection to handle Discrepancy and Traveler containers
  const handleScrollToSection = (sectionId) => {
    // Check if it's Discrepancy container
    if (sectionId === 'discrepancy-section' && discrepancyRef.current) {
      const element = discrepancyRef.current
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      window.scrollTo({
        top: absoluteElementTop - 80,
        behavior: 'smooth'
      })
      return
    }
    // Check if it's Traveler container
    if (sectionId === 'traveler-section' && travelerRef.current) {
      const element = travelerRef.current
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      window.scrollTo({
        top: absoluteElementTop - 80,
        behavior: 'smooth'
      })
      return
    }
    // For regular sections, use the original scrollToSection
    scrollToSection(sectionId)
  }

  return {
    sections,
    activeSection,
    handleSectionRegister,
    handleScrollToSection,
    discrepancyRef,
    travelerRef,
    hasDiscrepancyForm
  }
}