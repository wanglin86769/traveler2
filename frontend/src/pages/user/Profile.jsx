import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack
} from '@mui/material'
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Smartphone as MobileIcon, Business as BusinessIcon, AccessTime as TimeIcon, Shield as ShieldIcon } from '@mui/icons-material'

function Profile() {
  const { user } = useAuth()

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 400 }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          My profile
        </Typography>

        <Card 
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <InfoItem 
                icon={<PersonIcon />} 
                label="User id" 
                value={user?._id} 
              />
              <InfoItem 
                icon={<PersonIcon />} 
                label="Full name" 
                value={user?.name} 
              />
              <InfoItem 
                icon={<EmailIcon />} 
                label="Email" 
                value={user?.email} 
              />
              <InfoItem 
                icon={<BusinessIcon />} 
                label="Office" 
                value={user?.office} 
              />
              <InfoItem 
                icon={<PhoneIcon />} 
                label="Office Phone" 
                value={user?.phone} 
              />
              <InfoItem 
                icon={<MobileIcon />} 
                label="Mobile Phone" 
                value={user?.mobile} 
              />
              <InfoItem 
                icon={<TimeIcon />} 
                label="Last Visited" 
                value={formatDate(user?.lastLogin)} 
              />
              <InfoItem 
                icon={<ShieldIcon />} 
                label="Roles" 
                value={user?.roles?.join(', ')} 
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default Profile
