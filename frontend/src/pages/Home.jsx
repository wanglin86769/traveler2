import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Typography,
  Container,
  Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [titleIndex, setTitleIndex] = useState(0)

  const titleMessages = ['Work', 'Design', 'Organize', 'Collaborate']

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titleMessages.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const featureItems = [
    {
      icon: <i className="fa fa-list-ol" style={{ fontSize: 240 }}></i>,
      label: 'Design',
      path: '/forms/my-forms'
    },
    {
      icon: <i className="fa fa-check-square-o" style={{ fontSize: 240 }}></i>,
      label: 'Perform',
      path: '/travelers/my-travelers'
    },
    {
      icon: <i className="fa fa-briefcase" style={{ fontSize: 240 }}></i>,
      label: 'Organize',
      path: '/binders/my-binders'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: 60,
            fontWeight: 700,
            color: '#333',
            mb: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {titleMessages[titleIndex]}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#555',
            fontSize: 22,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mb: 5
          }}
        >
          With forms, travelers, and binders.{' '}
          <Typography
            component="span"
            onClick={() => navigate('/docs')}
            sx={{
              color: '#007BFF',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: '#0056b3',
                textDecoration: 'underline'
              }
            }}
          >
            Need help?
          </Typography>
        </Typography>
        <Divider sx={{ mt: 3, mb: 6 }} />
      </Box>

      {/* Feature Modules */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 25
        }}
      >
        {featureItems.map((item, index) => (
          <Box
            key={index}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              maxWidth: 200,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                '& i': {
                  color: '#0056b3'
                }
              }
            }}
          >
            <Box sx={{ color: '#0086D1', transition: 'color 0.2s ease-in-out' }}>
              {item.icon}
            </Box>
            <Typography
              variant="h2"
              sx={{
                mt: 1,
                fontSize: 24,
                fontWeight: 700,
                color: '#333'
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  )
}

export default Home