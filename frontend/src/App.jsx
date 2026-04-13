import { Routes, Route, Navigate } from 'react-router-dom'
import { useRef } from 'react'
import { CircularProgress, Box } from '@mui/material'
import { KeepAlive, AliveScope } from 'react-activation'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

import Login from './pages/auth/Login'
import Home from './pages/Home'
import MyForms from './pages/forms/MyForms'
import FormBuilder from './pages/forms/FormBuilder'
import FormDetail from './pages/forms/FormDetail'
import FormPreview from './pages/forms/FormPreview'
import FormReviewerList from './pages/forms/FormReviewerList'
import FormReview from './pages/forms/FormReview'
import FormShare from './pages/forms/FormShare'
import MyReviews from './pages/reviews/MyReviews'
import ReleasedForms from './pages/released-forms/ReleasedForms'
import ReleasedFormDetail from './pages/released-forms/ReleasedFormDetail'
import PublicForms from './pages/forms/PublicForms'
import Travelers from './pages/travelers/Travelers'
import TravelerDetail from './pages/travelers/TravelerDetail'
import TravelerInput from './pages/travelers/TravelerInput'
import Binders from './pages/binders/Binders'
import BinderDetail from './pages/binders/BinderDetail'
import Groups from './pages/admin/Groups'
import Profile from './pages/user/Profile'
import User from './pages/admin/User'
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
  const { loading, isAuthenticated } = useAuth()
  const isInitializedRef = useRef(false)

  // Mark as initialized after first render
  if (!loading && !isInitializedRef.current) {
    isInitializedRef.current = true
  }

  // Only show global loading during initial authentication check
  // Don't show it during login process to avoid flickering
  if (loading && !isInitializedRef.current) {
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
    <AliveScope>
      <Routes>
        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* User Profile Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/docs" element={<Docs />} />

          {/* Forms Routes */}
          <Route path="/forms" element={
            <KeepAlive 
              cacheKey="forms-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <ReleasedForms />
            </KeepAlive>
          } />
          <Route path="/forms/my-forms" element={
            <KeepAlive 
              cacheKey="my-forms-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <MyForms />
            </KeepAlive>
          } />
          <Route path="/forms/:id" element={<FormDetail />} />
          <Route path="/forms/:id/edit" element={<FormBuilder />} />
          <Route path="/forms/:id/share" element={<FormShare />} />
          <Route path="/forms/:id/preview" element={<FormPreview />} />
          <Route path="/forms/:id/reviewers" element={<FormReviewerList />} />
          <Route path="/forms/:id/review" element={<FormReview />} />
          
          {/* Released Forms Routes */}
          <Route path="/released-forms" element={
            <KeepAlive 
              cacheKey="released-forms-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <ReleasedForms />
            </KeepAlive>
          } />
          <Route path="/released-forms/:id" element={<ReleasedFormDetail />} />
          
          {/* Public Forms Routes */}
          <Route path="/public-forms" element={
            <KeepAlive 
              cacheKey="public-forms-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <PublicForms />
            </KeepAlive>
          } />
          
          {/* Travelers Routes */}
          <Route path="/travelers" element={
            <KeepAlive 
              cacheKey="travelers-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <Travelers />
            </KeepAlive>
          } />
          <Route path="/travelers/my-travelers" element={
            <KeepAlive 
              cacheKey="my-travelers-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <Travelers />
            </KeepAlive>
          } />
          <Route path="/travelers/:id" element={<TravelerDetail />} />
          <Route path="/travelers/:id/input" element={<TravelerInput />} />
          
          {/* Binders Routes */}
          <Route path="/binders" element={
            <KeepAlive 
              cacheKey="binders-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <Binders />
            </KeepAlive>
          } />
          <Route path="/binders/my-binders" element={
            <KeepAlive 
              cacheKey="my-binders-page" 
              maxAge={10 * 60 * 1000}
              autoFreeze={false}
            >
              <Binders />
            </KeepAlive>
          } />
          <Route path="/binders/:id" element={<BinderDetail />} />          
          
          {/* Reviews Routes */}
          <Route path="/reviews/my-reviews" element={<MyReviews />} />

          {/* Admin Route */}
          <Route path="/admin/users" element={<User />} />
          <Route path="/admin/groups" element={<Groups />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AliveScope>
  )
}

export default App