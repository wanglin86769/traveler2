import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { FORM_ELEMENT_DEFINITIONS, FORM_ELEMENT_TYPES } from './elementDefinitions'

import {
  TextFields,
  Numbers,
  ViewHeadline,
  EditNote,
  ArrowDropDownCircle,
  CheckBox,
  RadioButtonChecked,
  CalendarToday,
  AttachFile,
  Info,
  Email,
  Phone,
  Link,
  Schedule,
  ViewModule,
  Image
} from '@mui/icons-material'

const iconMap = {
  TextFields,
  Numbers,
  ViewHeadline,
  EditNote,
  ArrowDropDownCircle,
  CheckBox,
  RadioButtonChecked,
  CalendarToday,
  AttachFile,
  Info,
  Email,
  Phone,
  Link,
  Schedule,
  ViewModule,
  Image
}

function ElementButton({ type, displayName, icon, onAdd }) {
  const Icon = iconMap[icon]
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (onAdd) {
      onAdd(type)
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
    }
  }

  return (
    <Paper
      onClick={handleClick}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: isClicked ? '#e6f2ff' : 'background.paper',
        transform: isClicked ? 'scale(0.95)' : 'scale(1)',
        '&:hover': {
          bgcolor: isClicked ? '#e6f2ff' : 'action.hover',
          boxShadow: 1
        },
        transition: 'all 0.15s ease-in-out',
        userSelect: 'none'
      }}
    >
      {Icon && <Icon sx={{ color: isClicked ? 'primary.main' : 'text.secondary' }} />}
      <Typography variant="body2" fontWeight={500} sx={{ color: isClicked ? 'primary.main' : 'text.primary' }}>
        {displayName}
      </Typography>
    </Paper>
  )
}

function ElementPalette({ onAdd }) {
  const [expanded, setExpanded] = useState(['basic', 'advanced'])

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded((prev) => {
      if (newExpanded) {
        return [...prev, panel]
      } else {
        return prev.filter((p) => p !== panel)
      }
    })
  }

  const basicInputTypes = [
    FORM_ELEMENT_TYPES.CHECKBOX,
    FORM_ELEMENT_TYPES.CHECKBOX_SET,
    FORM_ELEMENT_TYPES.RADIO,
    FORM_ELEMENT_TYPES.TEXT,
    FORM_ELEMENT_TYPES.FIGURE,
    FORM_ELEMENT_TYPES.PARAGRAPH,
    FORM_ELEMENT_TYPES.NUMBER,
    FORM_ELEMENT_TYPES.FILE,
    FORM_ELEMENT_TYPES.DROPDOWN
  ]

  const otherTypes = [
    FORM_ELEMENT_TYPES.DATE,
    FORM_ELEMENT_TYPES.DATETIME,
    FORM_ELEMENT_TYPES.TIME,
    FORM_ELEMENT_TYPES.EMAIL,
    FORM_ELEMENT_TYPES.PHONE,
    FORM_ELEMENT_TYPES.URL
  ]

  const advancedControlTypes = [
    FORM_ELEMENT_TYPES.SECTION,
    FORM_ELEMENT_TYPES.INSTRUCTION
  ]

  const basicElements = FORM_ELEMENT_DEFINITIONS.filter(el => basicInputTypes.includes(el.type))
  const otherElements = FORM_ELEMENT_DEFINITIONS.filter(el => otherTypes.includes(el.type))
  const advancedElements = FORM_ELEMENT_DEFINITIONS.filter(el => advancedControlTypes.includes(el.type))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Click to add elements
      </Typography>

      {/* Basic Inputs Accordion */}
      <Accordion
        defaultExpanded
        expanded={expanded.includes('basic')}
        onChange={handleChange('basic')}
        sx={{
          boxShadow: 0,
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'grey.400',
          borderRadius: 1,
          overflow: 'hidden',
          '&.Mui-expanded': {
            margin: 0
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 40,
            '& .MuiAccordionSummary-content': { margin: '8px 0' },
            bgcolor: expanded.includes('basic') ? 'grey.50' : 'background.paper'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            Basic inputs
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {basicElements.map((element) => (
            <ElementButton
              key={element.type}
              type={element.type}
              displayName={element.displayName}
              icon={element.icon}
              onAdd={onAdd}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Other Types Accordion */}
      <Accordion
        expanded={expanded.includes('other')}
        onChange={handleChange('other')}
        sx={{
          boxShadow: 0,
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'grey.400',
          borderRadius: 1,
          overflow: 'hidden',
          '&.Mui-expanded': {
            margin: 0
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 40,
            '& .MuiAccordionSummary-content': { margin: '8px 0' },
            bgcolor: expanded.includes('other') ? 'grey.50' : 'background.paper'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            Other types
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {otherElements.map((element) => (
            <ElementButton
              key={element.type}
              type={element.type}
              displayName={element.displayName}
              icon={element.icon}
              onAdd={onAdd}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Advanced Control Accordion */}
      <Accordion
        defaultExpanded
        expanded={expanded.includes('advanced')}
        onChange={handleChange('advanced')}
        sx={{
          boxShadow: 0,
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'grey.400',
          borderRadius: 1,
          overflow: 'hidden',
          '&.Mui-expanded': {
            margin: 0
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 40,
            '& .MuiAccordionSummary-content': { margin: '8px 0' },
            bgcolor: expanded.includes('advanced') ? 'grey.50' : 'background.paper'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            Advanced control
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {advancedElements.map((element) => (
            <ElementButton
              key={element.type}
              type={element.type}
              displayName={element.displayName}
              icon={element.icon}
              onAdd={onAdd}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default ElementPalette