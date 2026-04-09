import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

import Login from './pages/auth/Login'
import Home from './pages/user/Home'
import MyForms from './pages/forms/MyForms'
import FormBuilder from './pages/forms/FormBuilder'
import FormDetail from './pages/forms/FormDetail'
import FormPreview from './pages/forms/FormPreview'
import FormReviewerList from './pages/forms/FormReviewerList'
import FormReview from './pages/forms/FormReview'
import MyReviews from './pages/reviews/MyReviews'
import ReleasedForms from './pages/released-forms/ReleasedForms'
import ReleasedFormDetail from './pages/released-forms/ReleasedFormDetail'
import Travelers from './pages/travelers/Travelers'
import TravelerDetail from './pages/travelers/TravelerDetail'
import TravelerInput from './pages/travelers/TravelerInput'
import Binders from './pages/binders/Binders'
import BinderDetail from './pages/binders/BinderDetail'
import Groups from './pages/admin/Groups'
import Profile from './pages/user/Profile'
import Admin from './pages/admin/Admin'
import Docs from './pages/Docs'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.some(role => user?.roles?.includes(role))) {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {
  const { loading } = useAuth()

  // Show global loading state while authenticating
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/docs" element={<Docs />} />

        {/* Forms Routes */}
        <Route path="/forms/my-forms" element={<MyForms />} />
        <Route path="/forms/reviews" element={<MyForms />} />
        <Route path="/forms/:id" element={<FormDetail />} />
        <Route path="/forms/:id/edit" element={<FormBuilder />} />
        <Route path="/forms/:id/preview" element={<FormPreview />} />
        <Route path="/forms/:id/reviewers" element={<FormReviewerList />} />
        <Route path="/forms/:id/review" element={<FormReview />} />
        
        {/* Released Forms Routes */}
        <Route path="/released-forms" element={<ReleasedForms />} />
        <Route path="/released-forms/:id" element={<ReleasedFormDetail />} />
        
        {/* Travelers Routes */}
        <Route path="/travelers" element={<Travelers />} />
        <Route path="/travelers/my-travelers" element={<Travelers />} />
        <Route path="/travelers/:id" element={<TravelerDetail />} />
        <Route path="/travelers/:id/input" element={<TravelerInput />} />
        
        {/* Binders Routes */}
        <Route path="/binders" element={<Binders />} />
        <Route path="/binders/my-binders" element={<Binders />} />
        <Route path="/binders/:id" element={<BinderDetail />} />
        
        {/* User Groups Route */}
        <Route path="/groups" element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <Groups />
          </ProtectedRoute>
        } />
        
        {/* User Profile Route */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Reviews Routes */}
        <Route path="/reviews/my-reviews" element={<MyReviews />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App