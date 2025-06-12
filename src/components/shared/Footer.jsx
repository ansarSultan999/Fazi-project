import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Briefcase className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">TalentHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting skilled service providers with customers in your local area.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-white">
                  Join as Provider
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Service Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Mehndi Artists
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Home Cleaners
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Private Tutors
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Beauticians
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Handymen
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-indigo-400 mt-0.5 mr-2" />
                <span className="text-gray-400">
                  123 Business Avenue, Tech Park, Mumbai 400001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-indigo-400 mr-2" />
                <span className="text-gray-400">+91 12345 67890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-indigo-400 mr-2" />
                <span className="text-gray-400">support@talenthub.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} TalentHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;