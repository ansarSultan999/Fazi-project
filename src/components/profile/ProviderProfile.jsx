import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageSquare,
  User,
  Shield,
  Clock
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { getProviderById, logProfileView, getProviderReviews, addProviderReview } from '../../services/providers';
import { createRequest, checkExistingRequest, getUserRequests } from '../../services/requests';
import { CreditCard, Banknote, Wallet } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import RequestModal from '../shared/RequestModal';

function ProviderProfile() {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [requestAccepted, setRequestAccepted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const { id } = useParams();
  const { currentUser, userDetails } = useAuth();
  

// Payment method state and modal logic are defined near the top of the ProviderProfile component:
const [paymentMethod, setPaymentMethod] = useState('');
const [paymentAmount, setPaymentAmount] = useState('');
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentLoading, setPaymentLoading] = useState(false);







// Stripe payment handler
const handleStripePayment = async () => {
  setPaymentLoading(true);
  try {
    const stripe = await loadStripe('YOUR_STRIPE_PUBLIC_KEY');
    const response = await fetch('/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentAmount,
        providerId: provider.id,
        userId: currentUser.uid
      }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (result.error) {
      toast.error(result.error.message);
    }
  } catch (error) {
    toast.error("Stripe payment failed.");
  } finally {
    setPaymentLoading(false);
  }
};

// Add this to your handlePaymentSubmit function for Razorpay
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handleRazorpayPayment = async () => {
  const loaded = await loadRazorpay();
  if (!loaded) {
    toast.error('Razorpay SDK failed to load');
    return;
  }

  const options = {
    key: 'YOUR_RAZORPAY_KEY',
    amount: paymentAmount * 100, // in paise
    currency: 'INR',
    name: provider.name,
    description: 'Service Payment',
    handler: function(response) {
      toast.success(`Payment ID: ${response.razorpay_payment_id}`);
    },
    prefill: {
      name: currentUser.displayName,
      email: currentUser.email,
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
// Add this payment handler function
const handlePaymentSubmit = async () => {
  if (!paymentMethod || !paymentAmount) {
    toast.error("Please select payment method and enter amount");
    return;
  }

  setPaymentLoading(true);
  try {
    if (paymentMethod === 'credit_card') {
      await handleStripePayment();
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('');
      return;
    }
    // In a real app, you would call your payment API here
    // This is just a simulation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Payment of ₹${paymentAmount} processed via ${paymentMethod}`);
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentMethod('');
  } catch (error) {
    toast.error("Payment failed. Please try again.");
  } finally {
    setPaymentLoading(false);
  }
};

  useEffect(() => {
    fetchProvider();
    if (currentUser && id) {
      checkRequest();
      // Log profile view
      if (currentUser.uid !== id) {
        logProfileView(id, currentUser.uid);
      }
    }
    fetchReviews();
  }, [id, currentUser]);
  
  const fetchProvider = async () => {
    try {
      setLoading(true);
      const providerData = await getProviderById(id);
      
      if (!providerData) {
        toast.error("Provider not found");
        return;
      }
      
      setProvider(providerData);
    } catch (error) {
      console.error("Error fetching provider:", error);
      toast.error("Failed to load provider profile");
    } finally {
      setLoading(false);
    }
  };
  
  // Check if the user's request is accepted
  const checkRequest = async () => {
    try {
      // If current user is the provider, allow access
      if (currentUser && currentUser.uid === id) {
        setRequestStatus('accepted');
        setRequestAccepted(true);
        return;
      }
      // Get all requests by this user to this provider
      const userRequests = await getUserRequests(currentUser.uid);
      const req = userRequests.find(r => r.providerId === id);
      if (req && req.status === 'accepted') {
        setRequestStatus('accepted');
        setRequestAccepted(true);
      } else if (req) {
        setRequestStatus('existing');
        setRequestAccepted(false);
      } else {
        setRequestStatus(null);
        setRequestAccepted(false);
      }
    } catch (error) {
      console.error("Error checking request:", error);
      setRequestAccepted(false);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const data = await getProviderReviews(id);
      setReviews(data);
    } catch {}
  };
  
  const handleRequestContact = () => {
    if (!currentUser) {
      toast.info("Please log in to contact service providers");
      return;
    }
    
    if (userDetails?.userType === 'provider') {
      toast.info("Providers cannot send contact requests");
      return;
    }
    
    setIsModalOpen(true);
  };
  
  const handleSendRequest = async (message) => {
    try {
      if (!currentUser || !provider) return;
      
      // Check if request already exists
      const hasExistingRequest = await checkExistingRequest(currentUser.uid, id);
      
      if (hasExistingRequest) {
        toast.info("You already have an active request with this provider");
        setIsModalOpen(false);
        return;
      }
      
      // Create new request
      await createRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName,
        providerId: provider.id,
        providerName: provider.name,
        message,
      });
      
      setRequestStatus('existing');
      toast.success("Request sent successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request");
    }
  };
  
  const handleAddReview = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    try {
      await addProviderReview(id, {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        text: reviewText,
        createdAt: new Date().toISOString()
      });
      setReviewText('');
      fetchReviews();
      toast.success("Review submitted!");
    } catch {
      toast.error("Failed to submit review");
    }
    setReviewLoading(false);
  };
  
  // Simple local chat for demonstration (replace with backend for production)
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages, 
      { 
        sender: currentUser.uid, 
        senderName: currentUser.displayName || (currentUser.uid === provider.id ? provider.name : "You"),
        text: chatInput, 
        time: new Date() 
      }
    ]);
    setChatInput('');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h2>
          <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/browse" 
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Browse Providers
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Provider Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 md:p-8">
            <div className="md:flex items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                {provider.imageUrl ? (
                  <img 
                    src={provider.imageUrl} 
                    alt={provider.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-100 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-indigo-600 text-4xl font-bold">
                      {provider.name.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{provider.name}</h1>
                  
                  {provider.rating && (
                    <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      <Star className="h-5 w-5 text-yellow-300 fill-current mr-1" />
                      <span className="font-semibold">{provider.rating}</span>
                    </div>
                  )}
                </div>
                
                {provider.skills && provider.skills.length > 0 && (
                  <div className="mb-4 flex flex-wrap">
                    {provider.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {provider.location && (
                  <div className="flex items-center text-white text-opacity-90">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {provider.location.city}
                      {provider.location.area && `, ${provider.location.area}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                {/* About Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {provider.bio || "No bio provided yet."}
                  </p>
                </div>
                
                {/* Services & Expertise */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Services & Expertise</h2>
                  
                  {provider.skills && provider.skills.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {provider.skills.map((skill, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No services listed yet.</p>
                  )}
                </div>
                
                {/* Reviews Section */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {reviews.length === 0 ? (
                      <div className="text-gray-600">No reviews yet</div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((r, idx) => (
                          <div key={idx} className="border-b pb-2">
                            <div className="font-semibold">{r.userName}</div>
                            <div className="text-gray-700 text-sm">{r.text}</div>
                            <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {currentUser && currentUser.uid !== id && (
                      <div className="mt-4">
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          rows={2}
                          className="w-full border rounded p-2 mb-2"
                          placeholder="Write a review..."
                        />
                        <button
                          onClick={handleAddReview}
                          disabled={reviewLoading}
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                          {reviewLoading ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Chat Section: Show if request is accepted for user or provider */}
                {currentUser && requestAccepted && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Chat with {currentUser.uid === provider.id ? "User" : provider.name}
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg mb-2 h-64 overflow-y-auto flex flex-col">
                      {chatMessages.length === 0 && (
                        <div className="text-gray-400 text-center my-auto">No messages yet</div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`mb-2 flex ${msg.sender === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`px-3 py-2 rounded-lg ${msg.sender === currentUser.uid ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            <span className="block font-semibold text-xs mb-1">{msg.senderName}</span>
                            <span>{msg.text}</span>
                            <div className="text-xs text-gray-300 mt-1">{msg.time.toLocaleTimeString()}</div>
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
                )}
              </div>
              
              {/* Sidebar */}
              <div>
                {/* Service Details Card */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                  
                  <div className="space-y-4">
                    {provider.pricing && (
                      <div className="flex items-start">
                        <DollarSign className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900">Pricing</h4>
                          <p className="text-gray-700">{provider.pricing}</p>
                        </div>
                      </div>
                    )}
                    
                    {provider.availability && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900">Availability</h4>
                          <p className="text-gray-700">{provider.availability}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Response Time</h4>
                        <p className="text-gray-700">Usually within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  {currentUser && requestAccepted ? (
                    <div className="space-y-4">
                      {provider.contactInfo?.phone && (
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">Phone</h4>
                            <p className="text-gray-700">{provider.contactInfo.phone}</p>
                          </div>
                        </div>
                      )}
                      {provider.contactInfo?.email && (
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email</h4>
                            <p className="text-gray-700">{provider.contactInfo.email}</p>
                          </div>
                        </div>
                      )}
                      {provider.contactInfo?.whatsapp && (
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">WhatsApp</h4>
                            <p className="text-gray-700">{provider.contactInfo.whatsapp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">
                        Contact information is protected. 
                        Send a request to view contact details.
                      </p>
                      
                      <button
                        onClick={handleRequestContact}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Request Contact Info
                      </button>
                      
                      {!currentUser && (
                        <p className="text-sm text-gray-500 mt-2">
                          <Link to="/login" className="text-indigo-600 hover:text-indigo-800">
                            Log in
                          </Link> to contact this provider
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Section: Add this block to always show the payment button in the sidebar */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Make a Payment</h3>
                  <p className="text-gray-600 mb-4">
                    Secure payment to book this service provider
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Make Payment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'credit_card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Credit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'paypal' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  PayPal
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'upi' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`flex items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === 'bank_transfer' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                >
                  <Banknote className="h-5 w-5 mr-2" />
                  Bank Transfer
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={paymentLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : 'Make Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Contact Modal */}
      {provider && (
        <RequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provider={provider}
          onSendRequest={handleSendRequest}
        />
      )}
    </div>
  );
}

export default ProviderProfile;