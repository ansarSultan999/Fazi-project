import React, { useState } from 'react';
import { Calendar, DollarSign, Star } from 'lucide-react';

function FilterSection({ onApplyFilters }) {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState([]);
  
  const availabilityOptions = [
    "Weekdays",
    "Weekends",
    "Mornings",
    "Afternoons",
    "Evenings"
  ];
  
  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
  };
  
  const toggleAvailability = (option) => {
    if (availability.includes(option)) {
      setAvailability(availability.filter(item => item !== option));
    } else {
      setAvailability([...availability, option]);
    }
  };
  
  const handleApplyFilters = () => {
    const filters = {
      priceRange,
      minRating,
      availability
    };
    
    onApplyFilters(filters);
  };
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Price Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Minimum Rating
          </label>
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setMinRating(rating)}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  minRating >= rating 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
        
        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Availability
          </label>
          <div className="flex flex-wrap gap-2">
            {availabilityOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleAvailability(option)}
                className={`px-3 py-1 rounded-full text-sm ${
                  availability.includes(option)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-right">
        <button
          type="button"
          onClick={handleApplyFilters}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default FilterSection;