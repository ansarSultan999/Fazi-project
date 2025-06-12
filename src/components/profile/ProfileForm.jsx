import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Save, 
  Upload, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { saveProviderProfile, getProviderByUserId } from '../../services/providers';

function ProfileForm() {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    skills: [],
    pricing: '',
    availability: '',
    location: {
      city: '',
      area: '',
      coordinates: null
    },
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    imageUrl: null,
      profileImage: '', // for base64 image
  });

  const [newSkill, setNewSkill] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { currentUser, userDetails } = useAuth();
  const { userLocation, getUserLocation } = useLocation();
  const navigate = useNavigate();
  
  // Skills list for suggestions
  const skillSuggestions = [
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
  
  // Load existing profile data if available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const providerData = await getProviderByUserId(currentUser.uid);
        
        if (providerData) {
          setProfile(prevProfile => ({
            ...prevProfile,
            ...providerData,
            name: providerData.name || currentUser.displayName || '',
            contactInfo: {
              ...prevProfile.contactInfo,
              ...(providerData.contactInfo || {}),
              email: providerData.contactInfo?.email || currentUser.email || '',
            }
          }));
          
          // Only show image if available
          if (providerData.profileImage) {
            setImagePreview(providerData.profileImage);
          } else if (providerData.imageUrl) {
            setImagePreview(providerData.imageUrl);
          }
        } else {
          // Initialize with user data from auth
          setProfile(prevProfile => ({
            ...prevProfile,
            name: currentUser.displayName || '',
            contactInfo: {
              ...prevProfile.contactInfo,
              email: currentUser.email || '',
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
        toast.error("Failed to load your profile");
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    if (!profile.skills.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill]
      });
    }
    
    setNewSkill('');
  };
  
  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setProfile(prev => ({
        ...prev,
        profileImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleUseCurrentLocation = () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }
    
    setProfile({
      ...profile,
      location: {
        ...profile.location,
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      }
    });
    
    toast.success("Current location saved");
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to save your profile");
      return;
    }
    
    try {
      setLoading(true);
      
      // Save profile without uploading image to Firebase
      const result = await saveProviderProfile(
        currentUser.uid,
        profile
      );
      
      toast.success("Profile saved successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {profile.id ? "Edit Your Profile" : "Create Your Provider Profile"}
            </h1>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    {imagePreview || profile.profileImage ? (
                      <img 
                        src={imagePreview || profile.profileImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-full border-4 border-indigo-100"
                      />
                    ) : (
                      // Only show image, no text
                      <div className="w-full h-full bg-indigo-100 rounded-full" />
                    )}
                    
                    <label 
                      htmlFor="profile-image" 
                      className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                    <input 
                      type="file" 
                      id="profile-image" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a professional profile picture
                  </p>
                </div>
                
                {/* Basic Info */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio / Description
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tell customers about yourself and your services..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h2>
                  <div className="mb-3">
                    <div className="flex">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., Mehndi Artist)"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        list="skill-suggestions"
                      />
                      <datalist id="skill-suggestions">
                        {skillSuggestions.map((skill, index) => (
                          <option key={index} value={skill} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.skills && profile.skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Service Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pricing
                      </label>
                      <input
                        type="text"
                        id="pricing"
                        name="pricing"
                        value={profile.pricing}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., ₹500-1000 per hour"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Availability
                      </label>
                      <input
                        type="text"
                        id="availability"
                        name="availability"
                        value={profile.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Weekdays 9AM-5PM"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    Location
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        id="location.city"
                        name="location.city"
                        value={profile.location.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select City</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Sialkot">Sialkot</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location.area" className="block text-sm font-medium text-gray-700 mb-1">
                        Area / Neighborhood
                      </label>
                      <input
                        type="text"
                        id="location.area"
                        name="location.area"
                        value={profile.location.area}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Gulberg"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {userLocation ? "Update" : "Use"} current location
                  </button>
                  
                  {profile.location.coordinates && (
                    <p className="text-sm text-green-600 mt-1">
                      Location coordinates saved
                    </p>
                  )}
                </div>
                
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    This information will only be shared with users who you approve.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="contactInfo.phone"
                        name="contactInfo.phone"
                        value={profile.contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+91 1234567890"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="contactInfo.email"
                        name="contactInfo.email"
                        value={profile.contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactInfo.whatsapp" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        id="contactInfo.whatsapp"
                        name="contactInfo.whatsapp"
                        value={profile.contactInfo.whatsapp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;