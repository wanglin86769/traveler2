import React, { useState } from 'react'
import { Button, Menu, MenuItem, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'

/**
 * MenuItemRenderer Component
 * Renders menu items for both desktop and mobile views
 */
function MenuItemRenderer({ item, isMobile, handleNavigation, isActive, hasRole }) {
  const [isMenuOpen, setMenuOpen] = useState(false)

  // Check if this item has children (submenu)
  if (item.children) {
    const hasAccessibleChild = item.children.some(child => !child.roles || hasRole(child.roles))
    if (!hasAccessibleChild) return null

    const isSubmenuActive = item.children.some(child => isActive(child.path))

    // Mobile version
    if (isMobile) {
      return (
        <React.Fragment key={item.text}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setMenuOpen(!isMenuOpen)}
              selected={isSubmenuActive}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {isMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          {isMenuOpen && (
            <List sx={{ pl: 3 }}>
              {item.children.map((child) => {
                if (child.roles && !hasRole(child.roles)) return null
                return (
                  <ListItem key={child.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(child.path)}
                      selected={isActive(child.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.text} />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          )}
        </React.Fragment>
      )
    }

    // Desktop version
    return (
      <React.Fragment key={item.text}>
        <Button
          onClick={(e) => setMenuOpen(e.currentTarget)}
          startIcon={item.icon}
          endIcon={isMenuOpen ? <ExpandLess /> : <ExpandMore />}
          sx={{
            color: 'white',
            fontWeight: (isMenuOpen || isSubmenuActive) ? 700 : 500,
            px: 2,
            py: 1,
            borderRadius: 2,
            width: 130,
            bgcolor: (isMenuOpen || isSubmenuActive) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)'
            },
            textTransform: 'none',
            fontSize: '1rem',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {item.text}
        </Button>
        <Menu
          anchorEl={isMenuOpen}
          open={Boolean(isMenuOpen)}
          onClose={() => setMenuOpen(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          disableScrollLock
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
              }
            }
          }}
          slotProps={{
            paper: {
              sx: {
                overflow: 'visible',
              }
            }
          }}
        >
          {item.children.map((child) => {
            if (child.roles && !hasRole(child.roles)) return null
            return (
              <MenuItem
                key={child.text}
                onClick={() => {
                  handleNavigation(child.path)
                  setMenuOpen(null)
                }}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  px: 2,
                  fontWeight: isActive(child.path) ? 600 : 400,
                  color: isActive(child.path) ? 'primary.main' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'rgba(30, 144, 255, 0.16)',
                    color: 'text.primary',
                    '& .MuiListItemIcon-root': {
                      color: 'text.secondary'
                    }
                  },
                  '&.Mui-selected': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                {child.icon && <Box sx={{ mr: 1.5, display: 'flex', fontSize: 20, color: isActive(child.path) ? 'primary.main' : 'text.secondary' }}>{child.icon}</Box>}
                {child.text}
              </MenuItem>
            )
          })}
        </Menu>
      </React.Fragment>
    )
  }

  // Regular menu item (no children)
  if (isMobile) {
    return (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActive(item.path)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    )
  }

  // Desktop regular menu item
  return (
    <Button
      key={item.text}
      onClick={() => handleNavigation(item.path)}
      startIcon={item.icon}
      sx={{
        color: 'white',
        fontWeight: isActive(item.path) ? 700 : 500,
        px: 2,
        py: 1,
        borderRadius: 2,
        width: 130,
        bgcolor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.15)'
        },
        textTransform: 'none',
        fontSize: '1rem',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {item.text}
    </Button>
  )
}

export default MenuItemRenderer