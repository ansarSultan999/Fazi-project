import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, MapPin, Star, Filter, X, Calendar, DollarSign } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { getAllProviders, getProvidersBySkill } from '../../services/providers';
import { createRequest, checkExistingRequest } from '../../services/requests';

import ServiceCard from './ServiceCard';
import FilterSection from './FilterSection';
import RequestModal from '../shared/RequestModal';

function BrowseTalent() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [useLiveLocation, setUseLiveLocation] = useState(true);
  
  const { currentUser, userDetails } = useAuth();
  const { userLocation, isWithinRadius } = useLocation();
  
  // Skills list
  const skills = [
    "Mehndi Artist", 
    "Home Cleaner", 
    "Private Tutor", 
    "Beautician", 
    "Handyman", 
    "Event Planner", 
    "Yoga Instructor", 
    "Chef", 
    "Photographer"
  ];
  
  // Locations list
  const locations = [
    "Lahore",
    "Islamabad",
    "Karachi",
    "Hyderabad",
    "Sialkot"
  ];
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);
  
  // Filter providers when filters change
  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedSkill, selectedLocation, userLocation, useLiveLocation]);
  
  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      let fetchedProviders;
      if (selectedSkill) {
        fetchedProviders = await getProvidersBySkill(selectedSkill);
      } else {
        fetchedProviders = await getAllProviders();
      }
      
      setProviders(fetchedProviders);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };
  
  const filterProviders = () => {
    let result = [...providers];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(provider => 
        provider.name?.toLowerCase().includes(term) ||
        provider.skills?.some(skill => skill.toLowerCase().includes(term)) ||
        provider.bio?.toLowerCase().includes(term)
      );
    }
    
    // Filter by skill
    if (selectedSkill) {
      result = result.filter(provider => 
        provider.skills?.includes(selectedSkill)
      );
    }
    
    // Filter by location
    if (selectedLocation) {
      result = result.filter(provider => 
        provider.location?.city === selectedLocation
      );
    }
    
    // Filter by distance (10km radius) if enabled and user location is available
    if (useLiveLocation && userLocation) {
      result = result.filter(provider => {
        if (provider.location?.coordinates) {
          // Haversine formula for distance in km
          const toRad = (value) => (value * Math.PI) / 180;
          const R = 6371; // Earth radius in km
          const lat1 = userLocation.latitude;
          const lon1 = userLocation.longitude;
          const lat2 = provider.location.coordinates.latitude;
          const lon2 = provider.location.coordinates.longitude;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return distance <= 10;
        }
        return false; // Only show providers with coordinates if userLocation is set
      });
    }
    
    setFilteredProviders(result);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    filterProviders();
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedLocation('');
    filterProviders();
  };
  
  const handleRequestContact = (provider) => {
    if (!currentUser) {
      toast.info("Please log in to contact service providers");
      return;
    }
    
    if (userDetails?.userType === 'provider') {
      toast.info("Providers cannot send contact requests");
      return;
    }
    
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };
  
  const handleSendRequest = async (message) => {
    try {
      if (!currentUser || !selectedProvider) return;
      
      // Check if request already exists
      const hasExistingRequest = await checkExistingRequest(currentUser.uid, selectedProvider.id);
      
      if (hasExistingRequest) {
        toast.info("You already have an active request with this provider");
        setIsModalOpen(false);
        return;
      }
      
      // Create new request
      await createRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        message,
      });
      
      toast.success("Request sent successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request");
    }
  };
  
  return (
    <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Service Providers</h1>
          <p className="mt-2 text-xl text-gray-600">
            Find skilled professionals in your area
          </p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, skill, or keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-56">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Skills</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-56">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Search
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                >
                  <Filter className="h-5 w-5 mr-1" />
                  Filters
                </button>
                
                {(searchTerm || selectedSkill || selectedLocation) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                  >
                    <X className="h-5 w-5 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
          
          {/* Advanced Filters Section */}
          {showFilters && (
            <FilterSection 
              onApplyFilters={filterProviders}
            />
          )}
        </div>
        
        {/* Live Location Toggle */}
        <div className="flex items-center mb-4">
          <input
            id="useLiveLocation"
            type="checkbox"
            checked={useLiveLocation}
            onChange={() => setUseLiveLocation(!useLiveLocation)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="useLiveLocation" className="ml-2 block text-sm text-gray-700">
            Show providers within 10km of my live location
          </label>
          {useLiveLocation && !userLocation && (
            <span className="ml-4 text-xs text-red-500">Location not available</span>
          )}
        </div>
        
        {/* Results section */}
        <div className="mt-4 mb-4">
          <p className="text-gray-600">
            Found {filteredProviders.length} service providers
            {userLocation && " within 10km of your location"}
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <ServiceCard 
                  key={provider.id}
                  provider={provider}
                  onRequestContact={() => handleRequestContact(provider)}
                />
              ))
            ) : (
              <div className="col-span-3 py-20 text-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No service providers found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button
                    onClick={clearFilters}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Request Contact Modal */}
      {selectedProvider && (
        <RequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provider={selectedProvider}
          onSendRequest={handleSendRequest}
        />
      )}
    </div>
  );
}

export default BrowseTalent;