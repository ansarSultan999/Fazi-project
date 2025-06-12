import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, DollarSign, Calendar } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

function ServiceCard({ provider, onRequestContact }) {
  const { currentUser } = useAuth();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {provider.profileImage || provider.imageUrl ? (
          <img 
            src={provider.profileImage || provider.imageUrl} 
            alt={provider.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-5xl font-bold">
              {provider.name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        
        {provider.rating && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-sm font-semibold">{provider.rating}</span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {provider.name}
        </h3>
        
        {provider.skills && provider.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap">
            {provider.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2 mb-2"
              >
                {skill}
              </span>
            ))}
            {provider.skills.length > 3 && (
              <span className="text-xs text-gray-500 py-0.5">+{provider.skills.length - 3} more</span>
            )}
          </div>
        )}
        
        {provider.bio && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {provider.bio}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          {provider.location && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {provider.location.city}
                {provider.location.area && `, ${provider.location.area}`}
              </span>
            </div>
          )}
          
          {provider.availability && (
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{provider.availability}</span>
            </div>
          )}
          
          {provider.pricing && (
            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              <span>{provider.pricing}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 pb-5 mt-auto">
        <div className="flex space-x-2">
          <Link 
            to={`/provider/${provider.id}`}
            className="flex-1 bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded text-center hover:bg-gray-200 transition-colors duration-200"
          >
            View Profile
          </Link>
          
          <button
            onClick={onRequestContact}
            className="flex-1 bg-indigo-600 text-white font-medium py-2 px-4 rounded text-center hover:bg-indigo-700 transition-colors duration-200"
          >
            Request Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;