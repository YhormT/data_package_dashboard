import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Phone, CheckCircle, XCircle, Clock, Package, Filter, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState('initiate'); // 'initiate', 'waiting', 'processing', 'success', 'failed'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [externalRef, setExternalRef] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Fetch shop products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Paystack callback redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const reference = urlParams.get('reference') || urlParams.get('trxref');
    
    if (paymentStatus === 'callback' && reference) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify the payment
      setShowPaymentModal(true);
      setPaymentStep('processing');
      setPaymentMessage('Verifying your payment...');
      verifyPayment(reference);
    }
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/shop/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching shop products:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load products. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setShowPaymentModal(true);
    setMobileNumber('');
    setExternalRef('');
    setPaymentStep('initiate');
    setPaymentMessage('');
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedProduct(null);
    setMobileNumber('');
    setExternalRef('');
    setPaymentStep('initiate');
    setPaymentMessage('');
    setIsProcessingPayment(false);
  };

  // Initialize Paystack payment
  const initiatePayment = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Swal.fire({
        title: 'Invalid Number',
        text: 'Please enter a valid mobile number (10 digits)',
        icon: 'warning',
      });
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage('Initializing payment...');

    try {
      const response = await axios.post(`${BASE_URL}/api/payment/initialize`, {
        mobileNumber: mobileNumber,
        amount: selectedProduct.price,
        productId: selectedProduct.id,
        productName: selectedProduct.name
      });

      if (response.data.success && response.data.paymentUrl) {
        setExternalRef(response.data.externalRef);
        
        // Redirect to Paystack payment page
        window.location.href = response.data.paymentUrl;
      } else {
        setPaymentStep('failed');
        setPaymentMessage(response.data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentStep('failed');
      setPaymentMessage(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Verify payment after redirect from Paystack
  const verifyPayment = async (reference) => {
    const refToVerify = reference || externalRef;
    
    if (!refToVerify) {
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStep('processing');
    setPaymentMessage('Verifying payment...');

    try {
      const response = await axios.post(`${BASE_URL}/api/payment/verify`, {
        reference: refToVerify
      });

      if (response.data.success) {
        setPaymentStep('success');
        setPaymentMessage('Payment verified! Your order has been placed.');
        
        Swal.fire({
          title: 'Order Placed!',
          html: `
            <div class="text-center">
              <p class="text-lg mb-2">Payment successful!</p>
              <p class="text-gray-600">Order ID: <strong>#${response.data.order?.id || 'N/A'}</strong></p>
              <p class="text-gray-600">Mobile: <strong>${mobileNumber}</strong></p>
              <p class="text-sm text-gray-500 mt-4">Use your mobile number to track your order.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#14b8a6'
        });

        closePaymentModal();
        fetchProducts();
      } else if (response.data.status === 'PENDING') {
        setPaymentStep('waiting');
        setPaymentMessage('Payment not yet confirmed. Please complete the payment and try again.');
      } else {
        setPaymentStep('failed');
        setPaymentMessage(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStep('failed');
      setPaymentMessage(error.response?.data?.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const trackOrder = async () => {
    if (!trackingNumber || trackingNumber.length < 10) {
      Swal.fire({
        title: 'Invalid Number',
        text: 'Please enter a valid mobile number',
        icon: 'warning',
      });
      return;
    }

    setIsTracking(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/shop/track?mobileNumber=${trackingNumber}`);
      setTrackedOrders(response.data.orders || []);
      
      if (response.data.orders?.length === 0) {
        Swal.fire({
          title: 'No Orders Found',
          text: 'No orders found for this mobile number.',
          icon: 'info',
        });
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to track order. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
      case 'canceled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Filter products based on active filter
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return products;
    return products.filter(product => {
      const upperName = product.name?.toUpperCase() || '';
      if (activeFilter === 'mtn') return upperName.includes('MTN');
      if (activeFilter === 'airtel') return upperName.includes('AIRTEL') || upperName.includes('TIGO');
      if (activeFilter === 'telecel') return upperName.includes('TELECEL');
      return true;
    });
  }, [products, activeFilter]);

  // Get carrier color based on product name
  const getCarrierGradient = (name) => {
    const upperName = name?.toUpperCase() || '';
    if (upperName.includes('MTN')) {
      return 'from-yellow-500 to-yellow-600';
    } else if (upperName.includes('TELECEL')) {
      return 'from-red-600 to-red-700';
    } else if (upperName.includes('AIRTEL') || upperName.includes('TIGO')) {
      return 'from-blue-500 to-blue-600';
    }
    return 'from-gray-600 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <ShoppingCart className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Kelishub Shop</h1>
              <p className="text-teal-100 text-sm">Buy Data Bundles Instantly</p>
            </div>
          </a>
          <button
            onClick={() => setShowTrackingModal(true)}
            className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Track Order
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 pb-24">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('mtn')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'mtn'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
              }`}
            >
              MTN
            </button>
            <button
              onClick={() => setActiveFilter('airtel')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'airtel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
              }`}
            >
              Airtel Tigo
            </button>
            <button
              onClick={() => setActiveFilter('telecel')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === 'telecel'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-red-100'
              }`}
            >
              Telecel
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600">
              {products.length === 0 ? 'No products available' : 'No products match this filter'}
            </h2>
            <p className="text-gray-500">
              {products.length === 0 ? 'Check back later for new products.' : 'Try selecting a different filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br ${getCarrierGradient(product.name)}`}
              >
                <div className="p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <p className="text-white/80 text-sm">{product.description}</p>
                    </div>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold">GHS {product.price.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleOrderClick(product)}
                    disabled={product.stock <= 0}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      product.stock > 0
                        ? 'bg-teal-500 hover:bg-teal-600 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-gray-200'
                    }`}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
              <h2 className="text-xl font-bold">
                {paymentStep === 'initiate' && 'Complete Your Order'}
                {paymentStep === 'waiting' && 'Complete Payment'}
                {paymentStep === 'processing' && 'Verifying Payment'}
                {paymentStep === 'success' && 'Payment Successful'}
                {paymentStep === 'failed' && 'Payment Failed'}
              </h2>
              <p className="text-teal-100 text-sm mt-1">
                {selectedProduct.name} - {selectedProduct.description}
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-teal-600">
                    GHS {selectedProduct.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {paymentMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  paymentStep === 'failed' ? 'bg-red-100 text-red-700' :
                  paymentStep === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {paymentMessage}
                </div>
              )}

              {/* Step 1: Enter Mobile Number */}
              {paymentStep === 'initiate' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0XX XXX XXXX"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      maxLength={10}
                      disabled={isProcessingPayment}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your MTN, AirtelTigo, or Telecel mobile money number
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={initiatePayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay with Mobile Money'
                      )}
                    </button>
                    
                    <button
                      onClick={closePaymentModal}
                      disabled={isProcessingPayment}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Waiting for payment */}
              {paymentStep === 'waiting' && (
                <>
                  <div className="mb-6 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 font-medium">Payment page opened in new tab</p>
                      <p className="text-yellow-700 text-sm mt-1">Complete your payment there, then return here.</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      After completing payment, click the button below to verify.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={verifyPayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'I Have Paid - Verify Payment'
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setPaymentStep('initiate');
                        setPaymentMessage('');
                      }}
                      disabled={isProcessingPayment}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Processing */}
              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-gray-600">Please wait while we process your payment...</p>
                </div>
              )}

              {/* Step 4: Success */}
              {paymentStep === 'success' && (
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your order has been placed successfully!</p>
                  <button
                    onClick={closePaymentModal}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Step 5: Failed */}
              {paymentStep === 'failed' && (
                <div className="text-center py-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Payment was not successful. Please try again.</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setPaymentStep('initiate');
                        setPaymentMessage('');
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closePaymentModal}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Payments are securely processed by Moolre
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Track Your Order</h2>
                  <p className="text-teal-100 text-sm mt-1">
                    Enter your mobile number to see order status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setTrackedOrders([]);
                    setTrackingNumber('');
                  }}
                  className="text-white hover:text-teal-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input
                  type="tel"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter mobile number"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  maxLength={10}
                />
                <button
                  onClick={trackOrder}
                  disabled={isTracking}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isTracking ? 'Searching...' : 'Track'}
                </button>
              </div>

              {/* Tracked Orders List */}
              <div className="max-h-[400px] overflow-y-auto">
                {trackedOrders.length > 0 ? (
                  <div className="space-y-4">
                    {trackedOrders.map((order) => (
                      <div key={order.orderId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-sm text-gray-500">Order ID</span>
                            <p className="font-bold text-gray-800">#{order.orderId}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 mb-2 border">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-800">{item.productName}</p>
                                <p className="text-sm text-gray-500">{item.productDescription}</p>
                                <p className="text-sm text-gray-600">GHS {item.price?.toFixed(2)}</p>
                              </div>
                              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {item.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Enter your mobile number to track orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-3 z-40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Kelishub. All rights reserved. Payments secured by Moolre
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
