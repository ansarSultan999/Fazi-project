import React, { useState } from 'react';
import { X } from 'lucide-react';

function RequestModal({ isOpen, onClose, provider, onSendRequest }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await onSendRequest(message);
      setMessage('');
    } catch (error) {
      console.error("Error in request modal:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-auto">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Request Contact Information
            </h3>
            
            <p className="text-gray-600 mb-6">
              Send a request to view {provider.name}'s contact information. They will need to approve your request before their details are shared.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the provider what service you're looking for..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
            {/* Show preview of message that will be sent to provider */}
            {message && (
              <div className="mt-4 bg-indigo-50 p-3 rounded">
                <div className="text-xs text-indigo-700 font-semibold mb-1">
                  This message will be shown to the provider:
                </div>
                <div className="text-indigo-900 text-sm">"{message}"</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestModal;