import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, Briefcase, ArrowRight } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

function SignUp() {
  const [userType, setUserType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    try {
      setLoading(true);
      await signup(email, password, userType, name);
      
      toast.success("Account created successfully!");
      
      // Redirect based on user type
      if (userType === 'provider') {
        navigate('/profile/edit');
      } else {
        navigate('/browse');
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-gray-600 mt-2">Join our service provider marketplace</p>
          </div>
          
          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-center text-gray-700 mb-4">I want to join as:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleUserTypeSelect('user')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                >
                  <UserPlus size={40} className="text-indigo-600 mb-3" />
                  <span className="text-lg font-medium text-gray-900">Customer</span>
                  <p className="text-gray-500 text-sm text-center mt-2">Find and hire service providers</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleUserTypeSelect('provider')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                >
                  <Briefcase size={40} className="text-indigo-600 mb-3" />
                  <span className="text-lg font-medium text-gray-900">Service Provider</span>
                  <p className="text-gray-500 text-sm text-center mt-2">Offer your services to customers</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Create a password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;