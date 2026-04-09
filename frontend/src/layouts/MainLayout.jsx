import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import systemService from '@/services/systemService'
import MenuItemRenderer from './MenuItemRenderer'

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List
} from '@mui/material'

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Description as FormIcon,
  Flight as TravelerIcon,
  Folder as BinderIcon,
  Groups as GroupIcon,
  ManageAccounts as AdminIcon,
  Person as UserIcon,
  RateReview as ReviewIcon,
  Visibility as PublicIcon,
  Publish as PublishIcon,
  LibraryBooks as LibraryIcon,
  Help as HelpIcon,
  Logout,
  Settings
} from '@mui/icons-material'

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/home' },
  {
    text: 'Forms',
    icon: <FormIcon />,
    children: [
      { text: 'My Forms', icon: <UserIcon />, path: '/forms/my-forms' },
      { text: 'Public Forms', icon: <PublicIcon />, path: '/released-forms' },
      { text: 'Released Forms', icon: <PublishIcon />, path: '/released-forms' },
      { text: 'Pending Reviews', icon: <ReviewIcon />, path: '/reviews/my-reviews' },
      { text: 'All Forms', icon: <LibraryIcon />, path: '/released-forms' }
    ]
  },
  {
    text: 'Travelers',
    icon: <TravelerIcon />,
    children: [
      { text: 'My Travelers', icon: <UserIcon />, path: '/travelers/my-travelers' },
      { text: 'Public Travelers', icon: <PublicIcon />, path: '/travelers' }
    ]
  },
  {
    text: 'Binders',
    icon: <BinderIcon />,
    children: [
      { text: 'My Binders', icon: <UserIcon />, path: '/binders/my-binders' },
      { text: 'Public Binders', icon: <PublicIcon />, path: '/binders' }
    ]
  },
  {
    text: 'Admin',
    icon: <AdminIcon />,
    children: [
      { text: 'Users', icon: <UserIcon />, path: '/admin', roles: ['admin'] },
      { text: 'Groups', icon: <GroupIcon />, path: '/groups', roles: ['admin', 'manager'] }
    ]
  },
  {
    text: 'Help',
    icon: <HelpIcon />,
    path: '/docs'
  }
]

function MainLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const location = useLocation()
  
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [systemInfo, setSystemInfo] = useState({
    deploymentName: '',
    version: ''
  })

  useEffect(() => {
    loadConfig()
    // Load only once when component mounts
  }, [])

  const loadConfig = async () => {
    try {
      const response = await systemService.getSystemInfo()
      setSystemInfo({
        deploymentName: response.deploymentName || '',
        version: response.version || ''
      })
    } catch (error) {
      console.error('Failed to load system info:', error)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Generate logo text with deployment name
  const logoText = systemInfo.deploymentName ? `Traveler-${systemInfo.deploymentName}` : 'Traveler'

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const hasRole = (roles) => {
    return roles.some(role => user?.roles?.includes(role))
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Mobile drawer
  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#1E90FF'
          }}
        >
          {logoText}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <MenuItemRenderer
            key={item.text}
            item={item}
            isMobile={true}
            handleNavigation={handleNavigation}
            isActive={isActive}
            hasRole={hasRole}
          />
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: '#1E90FF',
          color: 'white'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
          {/* Left: Logo and Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/home')}
            >
              <Typography 
                variant="h5"
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: '#F0F8FF',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: 0.5,
                  lineHeight: 1.2
                }}
              >
                {logoText}
              </Typography>
            </Box>
          </Box>

          {/* Center: Navigation Tabs (Desktop) */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.2,
                marginLeft: '5px'
              }}
            >
              {menuItems.map((item) => (
                <MenuItemRenderer
                  key={item.text}
                  item={item}
                  isMobile={false}
                  handleNavigation={handleNavigation}
                  isActive={isActive}
                  hasRole={hasRole}
                />
              ))}
            </Box>
          )}

          {/* Right: User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={handleUserMenuOpen}
              size="small"
              startIcon={<UserIcon />}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                textTransform: 'none',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {user?.email || user?.name || 'User'}
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              disableScrollLock
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose() }}>
                <UserIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleUserMenuClose}>
                <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Navigation Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: 2, sm: 3 },
          mt: 7, // Account for fixed AppBar
          minHeight: 'calc(100vh - 56px)',
          bgcolor: 'background.default'
        }}
      >
        <Outlet />
      </Box>

      {/* Release Version */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: '#0086D1',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: '#0056b3'
            }
          }}
        >
          Release {systemInfo.version || '0.0.0'}
        </Typography>
      </Box>
    </Box>
  )
}

export default MainLayout