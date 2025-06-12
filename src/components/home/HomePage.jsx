import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Shield, Clock, Users } from 'lucide-react';

function HomePage() {
  const categories = [
    { name: "Mehndi Artists", icon: "👰", count: 48 },
    { name: "Home Cleaners", icon: "🧹", count: 124 },
    { name: "Private Tutors", icon: "📚", count: 86 },
    { name: "Beauticians", icon: "💅", count: 73 },
    { name: "Handymen", icon: "🔧", count: 59 },
    { name: "Event Planners", icon: "🎉", count: 32 }
  ];
  
  const featuredProviders = [
    {
      id: 1,
      name: "Aisha Khan",
      skill: "Mehndi Artist",
      location: "Karachi",
      rating: 4.9,
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 2,
      name: "Waqar Ali",
      skill: "Home Cleaner",
      location: "Lahore",
      rating: 4.7,
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      name: "Sana Malik",
      skill: "Private Tutor",
      location: "Islamabad",
      rating: 4.8,
      image: "https://images.pexels.com/photos/3228213/pexels-photo-3228213.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];
  
  const testimonials = [
    {
      text: "I found an amazing mehndi artist for my wedding through TalentHub. She was professional and incredibly skilled!",
      author: "Meera Kapoor",
      role: "Customer",
      avatar: "https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      text: "As a tutor, TalentHub has helped me connect with many students in my area. It's been great for growing my business.",
      author: "Vikram Khanna",
      role: "Service Provider",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];
  
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Find Skilled Service Providers in Your Area
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Connect with trusted local professionals for all your service needs
            </p>
            
            <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row">
              <div className="flex-grow mb-2 md:mb-0 md:mr-2">
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full px-4 py-3 text-gray-700 rounded-md focus:outline-none"
                />
              </div>
              <div className="flex-grow mb-2 md:mb-0 md:mx-2">
                <input
                  type="text"
                  placeholder="Your location"
                  className="w-full px-4 py-3 text-gray-700 rounded-md focus:outline-none"
                />
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                <span>Search</span>
              </button>
            </div>
            
            <div className="mt-8">
              <Link
                to="/browse"
                className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition duration-200"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Service Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most in-demand services in your area
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} providers</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/browse"
              className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Providers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Service Providers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our top-rated professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <div 
                key={provider.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 font-semibold">{provider.rating}</span>
                    </div>
                  </div>
                  <p className="text-indigo-600 font-medium mb-2">{provider.skill}</p>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location}</span>
                  </div>
                  <Link
                    to={`/provider/${provider.id}`}
                    className="block w-full text-center bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/browse"
              className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              View All Providers
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TalentHub Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to find the perfect service provider
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Search</h3>
              <p className="text-gray-600">
                Find service providers in your area using our advanced search filters
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-600">
                Send a request to view contact details and connect directly
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hire</h3>
              <p className="text-gray-600">
                Hire the perfect service provider and leave a review after service
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Hear from our satisfied users across the platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white text-gray-800 p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Us CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl shadow-md p-8 md:p-12">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Are You a Service Provider?</h2>
                <p className="text-xl text-gray-600 mb-6 md:mb-0">
                  Join our platform to reach more customers in your area and grow your business
                </p>
              </div>
              <div className="md:w-1/3 md:text-right">
                <Link
                  to="/signup"
                  className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  Join as Provider
                </Link>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Reach More Clients</h3>
                  <p className="mt-2 text-gray-600">
                    Connect with customers looking for your specific skills and services
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Flexible Schedule</h3>
                  <p className="mt-2 text-gray-600">
                    Set your own availability and work on your terms
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Secure Platform</h3>
                  <p className="mt-2 text-gray-600">
                    Control who sees your contact info with our request system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;