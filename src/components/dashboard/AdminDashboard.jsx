import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Users, 
  User, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  Check, 
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { getAllProviders, deleteProviderProfile } from '../../services/providers';

function AdminDashboard() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const navigate = useNavigate();
  const { userDetails } = useAuth();
  useEffect(() => {
  if (userDetails && userDetails.userType !== 'admin') {
    navigate('/admin');
  }
  
  // Only fetch providers if user is admin
  if (userDetails && userDetails.userType === 'admin') {
    fetchProviders();
  }
}, [userDetails]);
  
  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, activeFilter]);
  
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const providersData = await getAllProviders();
      setProviders(providersData);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load providers");
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
        provider.location?.city?.toLowerCase().includes(term) ||
        provider.bio?.toLowerCase().includes(term)
      );
    }
    
    setFilteredProviders(result);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    filterProviders();
  };
  
  const confirmDelete = (providerId) => {
    setDeleteConfirmation(providerId);
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };
  
  const handleDeleteProvider = async (providerId) => {
    try {
      await deleteProviderProfile(providerId);
      
      // Update local state
      setProviders(providers.filter(provider => provider.id !== providerId));
      toast.success("Provider deleted successfully");
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error("Failed to delete provider");
    } finally {
      setDeleteConfirmation(null);
    }
  };
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-xl text-gray-600">
            Manage service providers and user accounts
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Providers</h2>
                <p className="text-2xl font-semibold text-gray-900">{providers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Active Providers</h2>
                <p className="text-2xl font-semibold text-gray-900">{providers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Suspended</h2>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <div className="relative flex-grow mb-4 md:mb-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search providers by name, skill, or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
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
                    onClick={() => setSearchTerm('')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Providers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Service Providers</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {provider.imageUrl ? (
                              <img 
                                src={provider.imageUrl} 
                                alt={provider.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                  {provider.name?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {provider.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {provider.contactInfo?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap">
                          {provider.skills && provider.skills.slice(0, 2).map((skill, index) => (
                            <span 
                              key={index}
                              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                            >
                              {skill}
                            </span>
                          ))}
                          {provider.skills && provider.skills.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{provider.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {provider.location?.city || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.location?.area || ""}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a 
                            href={`/provider/${provider.id}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                          
                          {deleteConfirmation === provider.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteProvider(provider.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => confirmDelete(provider.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;