import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  User, 
  MessageSquare,
  Eye,
  Trash2
} from 'lucide-react';

import { getProviderByUserId, deleteProviderProfile, getProviderCards, createProviderCard, deleteProviderCard } from '../../services/providers';
import { useAuth } from '../../contexts/AuthContext';
import { getProviderRequests, updateRequestStatus } from '../../services/requests';

function ProviderDashboard() {
  const [provider, setProvider] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ title: '', description: '', image: '' });
  const [cardImagePreview, setCardImagePreview] = useState('');
  const [chatModal, setChatModal] = useState({ open: false, userId: null, userName: '' });
  const [allChats, setAllChats] = useState({});
  const [chatInput, setChatInput] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      fetchProviderData();
      fetchRequests();
      fetchCards();
      setAllChats({}); // Reset chat state on login
    }
  }, [currentUser]);
  
  const fetchProviderData = async () => {
    try {
      const providerData = await getProviderByUserId(currentUser.uid);
      setProvider(providerData);
    } catch (error) {
      console.error("Error fetching provider data:", error);
      toast.error("Failed to load your profile");
    }
  };
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requestsData = await getProviderRequests(currentUser.uid);
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCards = async () => {
    try {
      const cardsData = await getProviderCards(currentUser.uid);
      setCards(cardsData);
    } catch (error) {
      toast.error("Failed to load your service cards");
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));
      
      toast.success(`Request ${status === 'accepted' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };
  
  // Remove any firebase upload logic for card images.
  const handleCardImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardImagePreview(reader.result);
      setNewCard(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCard = async () => {
    if (!newCard.title || !newCard.description) {
      toast.error("Title and description required");
      return;
    }
    try {
      // Save card with base64 image (no Firebase upload)
      const card = { ...newCard, image: cardImagePreview };
      // Simulate saving to backend or just add to local state for now
      setCards([...cards, { ...card, id: Date.now().toString() }]);
      setNewCard({ title: '', description: '', image: '' });
      setCardImagePreview('');
      toast.success("Service card created!");
    } catch (error) {
      toast.error("Failed to create card");
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteProviderCard(cardId);
      setCards(cards.filter(card => card.id !== cardId));
      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This will remove your provider profile and cards, but not your account.")) return;
    try {
      await deleteProviderProfile(currentUser.uid);
      toast.success("Profile deleted successfully");
      // Optionally, delete provider's cards here if needed
      // Reload dashboard so user can create a new profile
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete profile");
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !chatModal.userId) return;

    const newMsg = {
      sender: 'provider',
      text: chatInput,
      time: new Date().toISOString()
    };

    // Update local state
    setAllChats(prev => ({
      ...prev,
      [chatModal.userId]: [...(prev[chatModal.userId] || []), newMsg]
    }));

    // Save to localStorage for user to see
    try {
      // Get all requests from this user
      const userRequests = requests.filter(r => r.userId === chatModal.userId);

      // Save to providerChats (provider's sent messages)
      const providerChats = JSON.parse(localStorage.getItem('providerChats') || '{}');
      userRequests.forEach(request => {
        if (!providerChats[request.id]) providerChats[request.id] = [];
        providerChats[request.id].push(newMsg);
      });
      localStorage.setItem('providerChats', JSON.stringify(providerChats));

      // Also save to userChats (user's received messages)
      const userChats = JSON.parse(localStorage.getItem('userChats') || '{}');
      userRequests.forEach(request => {
        if (!userChats[request.id]) userChats[request.id] = [];
        userChats[request.id].push(newMsg);
      });
      localStorage.setItem('userChats', JSON.stringify(userChats));
    } catch (e) {
      console.error('Failed to save chat message:', e);
    }

    setChatInput('');
  };

  const handleOpenChat = (userId, userName, initialMessage) => {
    setChatModal({ open: true, userId, userName });
    setChatInput('');

    // Get all requests from this user
    const userRequests = requests.filter(r => r.userId === userId);

    // Collect all messages for this user from all their requests
    let allMsgs = [];

    userRequests.forEach(request => {
      // Initial user message from request
      if (request.message) {
        allMsgs.push({
          sender: 'user',
          text: request.message,
          time: request.createdAt || new Date()
        });
      }

      // Load from localStorage
      try {
        const providerChats = JSON.parse(localStorage.getItem('providerChats') || '{}');
        const userChats = JSON.parse(localStorage.getItem('userChats') || '{}');

        const providerMessages = providerChats[request.id] || [];
        const userAdditionalMessages = userChats[request.id] || [];

        allMsgs = allMsgs.concat(providerMessages, userAdditionalMessages);
      } catch (e) {
        // ignore
      }
    });

    // Remove duplicates (by sender, text, and time)
    const seen = new Set();
    const uniqueMsgs = allMsgs.filter(msg => {
      const key = `${msg.sender}|${msg.text}|${msg.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by time
    uniqueMsgs.sort((a, b) => new Date(a.time) - new Date(b.time));

    setAllChats(prev => ({
      ...prev,
      [userId]: uniqueMsgs
    }));
  };

  const handleCloseChat = () => {
    setChatModal({ open: false, userId: null, userName: '' });
    setChatInput('');
  };

  // Get messages for current chat user
  const chatMessages = chatModal.userId ? (allChats[chatModal.userId] || []) : [];

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'accepted') return request.status === 'accepted';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });
  
  const pendingCount = requests.filter(request => request.status === 'pending').length;
  const acceptedCount = requests.filter(request => request.status === 'accepted').length;
  const rejectedCount = requests.filter(request => request.status === 'rejected').length;
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="mt-2 text-xl text-gray-600">
            Manage your profile and contact requests
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
                <h2 className="text-sm font-medium text-gray-500">Total Requests</h2>
                <p className="text-2xl font-semibold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Accepted</h2>
                <p className="text-2xl font-semibold text-gray-900">{acceptedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Pending</h2>
                <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <h2 className="text-xl font-bold mb-4">Your Profile</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                {provider?.imageUrl ? (
                  <img 
                    src={provider.imageUrl} 
                    alt={provider.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {provider?.name || currentUser?.displayName || "Your Name"}
                  </h3>
                  {provider?.skills && provider.skills.length > 0 && (
                    <p className="text-indigo-600">{provider.skills[0]}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Profile Completion</span>
                  <span className="text-indigo-600 font-medium">
                    {provider ? "100%" : "0%"}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: provider ? "100%" : "0%" }}
                  ></div>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <Link
                    to="/profile/edit"
                    className="flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {provider ? "Edit Profile" : "Create Profile"}
                  </Link>
                  <button
                    onClick={handleDeleteProfile}
                    className="flex items-center justify-center w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete Profile
                  </button>
                </div>
                
                {provider && (
                  <div className="pt-2">
                    <Link
                      to={`/provider/${currentUser.uid}`}
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Requests Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className={`h-4 w-4 mr-2 ${
                    activeTab === 'pending' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  Pending
                  {pendingCount > 0 && (
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('accepted')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'accepted'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CheckCircle className={`h-4 w-4 mr-2 ${
                    activeTab === 'accepted' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  Accepted
                </button>
                
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'rejected'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <XCircle className={`h-4 w-4 mr-2 ${
                    activeTab === 'rejected' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  Rejected
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-500">
                    {activeTab === 'pending' 
                      ? "You don't have any pending requests" 
                      : activeTab === 'accepted'
                        ? "You haven't accepted any requests yet"
                        : "You haven't rejected any requests yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="sm:flex justify-between items-start">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            {/* Make user name clickable to open chat modal */}
                            <button
                              className="text-lg font-medium text-gray-900 hover:underline focus:outline-none"
                              onClick={() => handleOpenChat(request.userId, request.userName || "User", request.message)}
                              type="button"
                            >
                              {request.userName || "Anonymous User"}
                            </button>
                          </div>
                          
                          <p className="text-gray-500 text-sm mt-1">
                            Requested {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRequestAction(request.id, 'accepted')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-800 transition ease-in-out duration-150"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            
                            <button
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-800 transition ease-in-out duration-150"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accepted
                            </span>
                            {/* Chat button for accepted requests */}
                            <button
                              className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                              onClick={() => handleOpenChat(request.userId, request.userName || "User", request.message)}
                            >
                              Chat
                            </button>
                          </>
                        )}
                        
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Chat Modal */}
            {chatModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" style={{ width: '50%' }}>
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={handleCloseChat}
                  >
                    ×
                  </button>
                  <h3 className="text-lg font-bold mb-2">Chat with {chatModal.userName}</h3>
                  <div className="border rounded p-2 h-64 overflow-y-auto bg-gray-50 mb-2 flex flex-col">
                    {chatMessages.length === 0 && (
                      <div className="text-gray-400 text-center my-auto">No messages yet</div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`mb-2 flex ${msg.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`px-3 py-2 rounded-lg ${msg.sender === 'provider' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          <span className="font-semibold">{msg.sender === 'provider' ? 'You' : chatModal.userName}:</span> {msg.text}
                          <div className="text-xs text-gray-300 mt-1">{msg.time instanceof Date ? msg.time.toLocaleTimeString() : new Date(msg.time).toLocaleTimeString()}</div>
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
            {/* Service Cards Section */}
            <div className="m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Service Cards</h2>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Card Title"
                  value={newCard.title}
                  onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCard.description}
                  onChange={e => setNewCard({ ...newCard, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCardImageChange}
                  className="block"
                />
                {cardImagePreview && (
                  <img src={cardImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                )}
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={handleCreateCard}
                  type="button"
                >
                  Add Card
                </button>
              </div>
              <div className="space-y-4">
                {cards.map(card => (
                  <div key={card.id} className="border p-4 rounded flex items-center gap-4">
                    {card.image && (
                      <img src={card.image} alt="Card" className="w-16 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{card.title}</div>
                      <div className="text-gray-600">{card.description}</div>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="text-gray-500">No service cards yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;