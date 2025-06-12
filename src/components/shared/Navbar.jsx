import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, User, LogOut, Settings, Users } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TalentHub</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/browse"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Talent
              </Link>
              
              {currentUser ? (
                <div className="relative ml-3 group">
                  <button className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    <span className="mr-1">{currentUser.displayName || 'Account'}</span>
                    <User className="h-5 w-5" />
                  </button>
                  
                  <div className="hidden group-hover:block absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {userDetails?.userType === 'provider' && (
                      <>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile/edit"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          Edit Profile
                        </Link>
                      </>
                    )}
                    
                    {userDetails?.userType === 'user' && (
                      <Link
                        to="/my-requests"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        My Requests
                      </Link>
                    )}
                    
                    {userDetails?.userType === 'admin' && (
                      <Link
                        to="/admindashboard"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Browse Talent
            </Link>
            
            {currentUser ? (
              <>
                {userDetails?.userType === 'provider' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  </>
                )}
                
                {userDetails?.userType === 'user' && (
                  <Link
                    to="/my-requests"
                    className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Requests
                  </Link>
                )}
                
                {userDetails?.userType === 'admin' && (
                  <Link
                    to="/admindashboard"
                    className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;