import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';

import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import HomePage from './components/home/HomePage';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import BrowseTalent from './components/browse/BrowseTalent';
import ProviderDashboard from './components/dashboard/ProviderDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProfileForm from './components/profile/ProfileForm';
import ProviderProfile from './components/profile/ProviderProfile';
import UserRequests from './components/requests/UserRequests';

// Custom Login wrapper to redirect after login
function LoginWithRedirect() {
  const { currentUser, userDetails, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser && userDetails) {
      // Only redirect if we're on /login (prevents redirect loop)
      if (location.pathname === '/login') {
        if (userDetails.userType === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userDetails.userType === 'provider') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/my-requests', { replace: true });
        }
      }
    }
  }, [currentUser, userDetails, loading, navigate, location.pathname]);

  return <Login />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<LoginWithRedirect />} />
                <Route path="/browse" element={<BrowseTalent />} />
                <Route path="/provider/:id" element={<ProviderProfile />} />

                {/* Admin route */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Provider routes */}
                <Route path="/dashboard" element={<ProviderDashboard />} />
                <Route path="/profile/edit" element={<ProfileForm />} />
                
                {/* User routes */}
                <Route path="/my-requests" element={<UserRequests />} />
                
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer 
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;