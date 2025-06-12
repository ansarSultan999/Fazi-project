import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { getUserRequests } from '../../services/requests';

function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allChats, setAllChats] = useState({});
  const [chatModal, setChatModal] = useState({ open: false, requestId: null, providerName: '' });
  const [chatInput, setChatInput] = useState('');

  const { currentUser } = useAuth();

  // Load chats from localStorage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem('userChats');
    if (storedChats) {
      try {
        setAllChats(JSON.parse(storedChats));
      } catch {
        setAllChats({});
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    // Prevent clearing if allChats is empty but there are messages in localStorage
    if (Object.keys(allChats).length > 0) {
      localStorage.setItem('userChats', JSON.stringify(allChats));
    }
  }, [allChats]);
  
  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requestsData = await getUserRequests(currentUser.uid);
      
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your request is pending. The provider will review it soon.';
      case 'accepted':
        return 'Great! Your request has been accepted. You can now chat with the provider.';
      case 'rejected':
        return 'Your request was rejected. You can try contacting other providers.';
      default:
        return '';
    }
  };
  
  // Helper to send a message (from user) for a request
  const handleUserSendMessage = (requestId, message) => {
    setAllChats(prev => {
      // Always include the original message as the first message
      const req = requests.find(r => r.id === requestId);
      let prevMsgs = prev[requestId] || [];
      if (prevMsgs.length === 0 && req) {
        prevMsgs = [
          { sender: 'user', text: req.message || '', time: req.createdAt || new Date() }
        ];
      }
      const updatedMsgs = [
        ...prevMsgs,
        { sender: 'user', text: message, time: new Date().toISOString() }
      ];

      // Simulate sending to provider: save to providerChats in localStorage
      // (providerChats keyed by requestId, each value is an array of {sender, text, time})
      const providerChatsKey = 'providerChats';
      let providerChats = {};
      try {
        providerChats = JSON.parse(localStorage.getItem(providerChatsKey)) || {};
      } catch {
        providerChats = {};
      }
      // Save the message under the requestId for provider to read as a chat thread
      if (!providerChats[requestId]) providerChats[requestId] = [];
      providerChats[requestId].push({
        sender: 'user',
        text: message,
        time: new Date().toISOString()
      });
      localStorage.setItem(providerChatsKey, JSON.stringify(providerChats));

      return {
        ...prev,
        [requestId]: updatedMsgs
      };
    });
  };

  // Helper to open chat modal
  const handleOpenChat = (requestId, providerName) => {
    setChatModal({ open: true, requestId, providerName });
    setChatInput('');
    // On open, merge all user/provider messages for this request
    const req = requests.find(r => r.id === requestId);
    let allMsgs = [];
    if (req && req.message) {
      allMsgs.push({
        sender: 'user',
        text: req.message,
        time: req.createdAt || new Date()
      });
    }
    try {
      const userChats = JSON.parse(localStorage.getItem('userChats') || '{}');
      const providerChats = JSON.parse(localStorage.getItem('providerChats') || '{}');
      allMsgs = allMsgs
        .concat(userChats[requestId] || [], providerChats[requestId] || [])
        .filter(m => m && m.text);
    } catch {}
    // Remove duplicates
    const seen = new Set();
    const uniqueMsgs = allMsgs.filter(msg => {
      const key = `${msg.sender}|${msg.text}|${msg.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    uniqueMsgs.sort((a, b) => new Date(a.time) - new Date(b.time));
    setAllChats(prev => ({
      ...prev,
      [requestId]: uniqueMsgs
    }));
  };

  const handleCloseChat = () => {
    setChatModal({ open: false, requestId: null, providerName: '' });
    setChatInput('');
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !chatModal.requestId) return;
    handleUserSendMessage(chatModal.requestId, chatInput);
    setChatInput('');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-2 text-xl text-gray-600">
            Track the status of your contact requests
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Contact Requests</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-6">
                You haven't sent any contact requests yet
              </p>
              <Link
                to="/browse"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Browse Providers
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 mr-3">
                              {request.providerName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </span>
                            {/* Chat button for accepted requests */}
                            {request.status === 'accepted' && (
                              <button
                                className="ml-3 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                                onClick={() => handleOpenChat(request.id, request.providerName)}
                                type="button"
                              >
                                Chat
                              </button>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-1">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link
                            to={`/provider/${request.providerId}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Link>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className="mt-4">
                          {/* Only show chat in modal for accepted requests */}
                          {request.status !== 'accepted' && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="mb-2 text-sm font-medium text-gray-700">Your message to {request.providerName}</div>
                              <div className="flex">
                                <div className="bg-indigo-100 text-indigo-900 px-3 py-2 rounded-lg rounded-bl-none max-w-xs text-sm">
                                  <span className="font-semibold">You:</span> {request.message}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Status-specific messages */}
                      <div className="mt-4">
                        {request.status === 'pending' && (
                          <div className="bg-yellow-50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Request Pending
                            </h4>
                            <p className="text-yellow-700 text-sm">
                              {getStatusMessage(request.status)}
                            </p>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <div className="bg-green-50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Request Accepted!
                            </h4>
                            <p className="text-green-700 text-sm mb-3">
                              {getStatusMessage(request.status)}
                            </p>
                          </div>
                        )}
                        
                        {request.status === 'rejected' && (
                          <div className="bg-red-50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" />
                              Request Rejected
                            </h4>
                            <p className="text-red-700 text-sm mb-3">
                              {getStatusMessage(request.status)}
                            </p>
                            <Link
                              to="/browse"
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                            >
                              Browse Other Providers
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat Modal */}
              {chatModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative" style={{ width: '50%' }}>
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      onClick={handleCloseChat}
                    >
                      ×
                    </button>
                    <h3 className="text-lg font-bold mb-2">Chat with {chatModal.providerName}</h3>
                    <div className="border rounded p-2 h-64 overflow-y-auto bg-gray-50 mb-2 flex flex-col">
                      {(allChats[chatModal.requestId] || []).length === 0 && (
                        <div className="text-gray-400 text-center my-auto">No messages yet</div>
                      )}
                      {(allChats[chatModal.requestId] || []).map((msg, idx) => (
                        <div
                          key={idx}
                          className={`mb-2 flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`px-3 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            <span className="font-semibold">{msg.sender === 'user' ? 'You' : chatModal.providerName}:</span> {msg.text}
                            <div className="text-xs text-gray-300 mt-1">
                              {msg.time instanceof Date
                                ? msg.time.toLocaleTimeString()
                                : new Date(msg.time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                      />
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        onClick={handleSendChat}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserRequests;