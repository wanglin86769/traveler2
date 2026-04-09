import { Box, Typography, Container, Paper, Divider } from '@mui/material'

function Docs() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: 48,
          fontWeight: 700,
          color: '#333',
          mb: 3,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        Documentation
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0086D1' }}>
          Getting Started
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8 }}>
          Welcome to Traveler - Lab Data Collection System. This documentation will help you understand how to use the platform effectively.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0086D1' }}>
          Forms
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
          Forms are the building blocks of data collection in Traveler. You can create, edit, and manage forms to suit your specific data collection needs.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
          • Create new forms from templates or scratch<br />
          • Define form fields and validation rules<br />
          • Set up approval workflows<br />
          • Version control for form updates
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0086D1' }}>
          Travelers
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
          Travelers represent individual instances of data collection. Each traveler is based on a form and contains the actual data collected.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
          • Fill out form instances<br />
          • Track progress and status<br />
          • Transfer ownership between users<br />
          • Review and approve submissions
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0086D1' }}>
          Binders
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
          Binders allow you to organize and group related travelers together for better management and reporting.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
          • Create binders to organize travelers<br />
          • Add travelers to binders<br />
          • Share binders with groups<br />
          • Generate reports from binder data
        </Typography>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0086D1' }}>
          Support
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8 }}>
          For additional help or questions, please contact your system administrator or refer to the internal documentation resources available at your organization.
        </Typography>
      </Paper>
    </Container>
  )
}

export default Docs