import React from 'react'
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material'

/**
 * Form side navigation component
 * Displays a sidebar with section navigation links
 * @param {Object} props
 * @param {Array} props.sections - Array of section objects
 * @param {string} props.formTitle - Title to display in sidebar header
 * @param {string} props.activeSection - Currently active section ID
 * @param {Function} props.onSectionClick - Callback when a section is clicked
 * @param {string} props.position - CSS position (default: 'fixed')
 * @param {number|string} props.top - CSS top value (default: 176)
 * @param {number|string} props.right - CSS right value (default: 24)
 * @param {number|string} props.width - CSS width (default: 280)
 * @param {string} props.maxHeight - CSS maxHeight (default: 'calc(100vh - 196px)')
 * @param {number} props.zIndex - CSS zIndex (default: 100)
 * @returns {JSX.Element}
 */
const FormSideNavigation = ({
  sections,
  formTitle,
  activeSection,
  onSectionClick,
  position = 'fixed',
  top = 176,
  right = 24,
  width = 280,
  maxHeight = 'calc(100vh - 196px)',
  zIndex = 100
}) => {
  return (
    <Box
      sx={{
        position,
        top,
        right,
        width,
        maxHeight,
        overflowY: 'auto',
        zIndex
      }}
    >
      <Paper variant="outlined" elevation={0} sx={{ overflow: 'hidden' }}>
        {/* Sidebar Header - Orange Title Bar */}
        <Box sx={{ 
          bgcolor: '#ff9024',
          px: 2,
          py: 1.5
        }}>
          <Typography 
            variant="h5"
            fontWeight={600}
            sx={{ color: 'white' }}
          >
            {formTitle || 'Form Navigation'}
          </Typography>
        </Box>
        
        {/* Navigation Items */}
        <Box sx={{ p: 2 }}>
          <List dense>
            {sections.map((section, index) => {
              const sectionId = section.id || section.name
              const isActive = activeSection === sectionId

              return (
                <ListItem
                  key={sectionId}
                  button
                  onClick={(e) => {
                    e.preventDefault()
                    onSectionClick(sectionId)
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.light' : 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemText
                    primary={section.legend || section.label || `Section ${index + 1}`}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'white' : 'text.primary'
                    }}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Paper>
    </Box>
  )
}

export default FormSideNavigation