import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Avatar,
  Chip,
  Divider,
  Snackbar,
  Alert
} from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'

function Profile() {
  const { user } = useAuth()
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: 40,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || <PersonIcon sx={{ fontSize: 50 }} />}
              </Avatar>
              
              <Typography variant="h5" fontWeight={600}>
                {user?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Roles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                {user?.roles?.map((role) => (
                  <Chip key={role} label={role} size="small" color="primary" />
                ))}
                {(!user?.roles || user.roles.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No roles assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={user?._id}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={user?.name || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={user?.phone || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={user?.mobile || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Office"
                    value={user?.office || ''}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{
          top: '80px'
        }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Profile
