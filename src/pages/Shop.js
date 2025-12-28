import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Phone, CheckCircle, XCircle, Clock, Package, Filter, Loader2, MessageCircle, Shield, Zap, Wifi, Star, ArrowRight, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

// Helper function to format phone number from 233XXXXXXXXX to 0XXXXXXXXX
const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const phoneStr = String(phone).replace(/\D/g, '');
  if (phoneStr.startsWith('233') && phoneStr.length >= 12) {
    return '0' + phoneStr.slice(3, 12);
  }
  if (phoneStr.length === 10 && phoneStr.startsWith('0')) {
    return phoneStr;
  }
  if (phoneStr.length === 9) {
    return '0' + phoneStr;
  }
  return phoneStr.slice(-10).padStart(10, '0');
};

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
  const [selectedProductGradient, setSelectedProductGradient] = useState('from-amber-600 to-amber-700');

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
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching shop products:', error);
      // Set products to empty array instead of showing error
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setSelectedProductGradient(getCarrierGradient(product.name));
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
    setSelectedProductGradient('from-amber-600 to-amber-700');
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
              <p class="text-gray-600 mb-1">Order ID: <strong>#${response.data.order?.id || 'N/A'}</strong></p>
              <p class="text-gray-600 mb-3">Mobile: <strong>${formatPhoneNumber(mobileNumber || response.data.order?.mobileNumber)}</strong></p>
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

  // Filter and sort products based on active filter
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (activeFilter !== 'all') {
      filtered = products.filter(product => {
        const upperName = product.name?.toUpperCase() || '';
        if (activeFilter === 'mtn') return upperName.includes('MTN');
        if (activeFilter === 'airtel') return upperName.includes('AIRTEL') || upperName.includes('TIGO');
        if (activeFilter === 'telecel') return upperName.includes('TELECEL');
        return true;
      });
    }
    
    // Sort by network: MTN first, then Telecel, then Airtel Tigo, then others
    return filtered.sort((a, b) => {
      const getNetworkPriority = (name) => {
        const upperName = name?.toUpperCase() || '';
        if (upperName.includes('MTN')) return 1;
        if (upperName.includes('TELECEL')) return 2;
        if (upperName.includes('AIRTEL') || upperName.includes('TIGO')) return 3;
        return 4;
      };
      
      return getNetworkPriority(a.name) - getNetworkPriority(b.name);
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelishub</h1>
                <p className="text-xs text-yellow-600 font-medium tracking-wider uppercase">Data Shop</p>
              </div>
            </a>
            <button
              onClick={() => setShowTrackingModal(true)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white font-medium transition-all duration-300 shadow-md"
            >
              <Search className="w-4 h-4 text-white" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/30 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-700 text-sm font-medium">Instant Data Delivery</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Premium Data Bundles
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500">
                At Unbeatable Prices
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get connected instantly with our reliable data packages. Fast delivery, secure payments, and 24/7 support for all networks.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">All Networks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Filter className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-gray-900 font-semibold">Filter by Network</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Networks', activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' },
              { id: 'mtn', label: 'MTN', activeClass: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25' },
              { id: 'airtel', label: 'AirtelTigo', activeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' },
              { id: 'telecel', label: 'Telecel', activeClass: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? filter.activeClass
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-500" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading bundles...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex p-6 bg-gray-100 rounded-full mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {products.length === 0 ? 'No Products Available' : 'No Matches Found'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {products.length === 0 ? 'Check back later for new data bundles.' : 'Try selecting a different network filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl border border-gray-200 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20"
              >
                {/* Card Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${getCarrierGradient(product.name)} blur-3xl -z-10`} />
                
                {/* Card Header */}
                <div className={`relative p-6 bg-gradient-to-br ${getCarrierGradient(product.name)}`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="w-5 h-5 text-white/80" />
                        <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Data Bundle</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      product.stock > 0 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : 'bg-red-500/80 text-white'
                    }`}>
                      {product.stock > 0 ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-900 mb-4 text-3xl font-bold leading-relaxed">{product.description}</p>
                  
                  {/* Price */}
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-2xl font-bold text-gray-900">GHS {product.price.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm mb-1">/ bundle</span>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                      <Zap className="w-3 h-3" /> Instant
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      <Shield className="w-3 h-3" /> Secure
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                      <Star className="w-3 h-3" /> Premium
                    </span>
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => handleOrderClick(product)}
                    disabled={product.stock <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                      product.stock > 0
                        ? `bg-gradient-to-r ${getCarrierGradient(product.name)} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? (
                      <>
                        <span>Purchase Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-300">
            <div className={`relative bg-gradient-to-r ${selectedProductGradient} p-8`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Data Bundle</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {paymentStep === 'initiate' && 'Complete Your Order'}
                  {paymentStep === 'waiting' && 'Complete Payment'}
                  {paymentStep === 'processing' && 'Verifying Payment'}
                  {paymentStep === 'success' && 'Payment Successful'}
                  {paymentStep === 'failed' && 'Payment Failed'}
                </h2>
                <p className="text-white/80 text-lg font-bold mt-2">
                  {selectedProduct.name} - {selectedProduct.description}
                </p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount to Pay</span>
                  <span className="text-3xl font-bold text-gray-900">
                    GHS {selectedProduct.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {paymentMessage && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                  paymentStep === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  paymentStep === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {paymentMessage}
                </div>
              )}

              {/* Step 1: Enter Mobile Number */}
              {paymentStep === 'initiate' && (
                <>
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Phone className="w-4 h-4 text-yellow-600" />
                      Data Bundle Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0XX XXX XXXX"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      maxLength={10}
                      disabled={isProcessingPayment}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedProduct.name.toLowerCase().includes('mtn') 
                        ? 'Enter your MTN number'
                        : selectedProduct.name.toLowerCase().includes('telecel')
                        ? 'Enter your Telecel number'
                        : selectedProduct.name.toLowerCase().includes('airtel')
                        ? 'Enter your AirtelTigo number'
                        : 'Enter your mobile number'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={initiatePayment}
                      disabled={isProcessingPayment}
                      className={`w-full bg-gradient-to-r ${selectedProductGradient} text-white py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay with Mobile Money
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={closePaymentModal}
                      disabled={isProcessingPayment}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all border border-gray-200"
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
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-4">
                      <p className="text-amber-400 font-medium">Payment page opened</p>
                      <p className="text-amber-400/70 text-sm mt-1">Complete your payment there, then return here.</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      After completing payment, click the button below to verify.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={verifyPayment}
                      disabled={isProcessingPayment}
                      className={`w-full bg-gradient-to-r ${selectedProductGradient} text-white py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg`}
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
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Processing */}
              {paymentStep === 'processing' && (
                <div className="text-center py-10">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="relative w-16 h-16 animate-spin text-amber-500" />
                  </div>
                  <p className="text-gray-600 mt-6">Please wait while we process your payment...</p>
                </div>
              )}

              {/* Step 4: Success */}
              {paymentStep === 'success' && (
                <div className="text-center py-6">
                  <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                    <CheckCircle className="w-16 h-16 text-emerald-400" />
                  </div>
                  <p className="text-gray-700 mb-6">Your order has been placed successfully!</p>
                  <button
                    onClick={closePaymentModal}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-bold transition-all hover:shadow-lg"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Step 5: Failed */}
              {paymentStep === 'failed' && (
                <div className="text-center py-6">
                  <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
                    <XCircle className="w-16 h-16 text-red-400" />
                  </div>
                  <p className="text-gray-700 mb-6">Payment was not successful. Please try again.</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setPaymentStep('initiate');
                        setPaymentMessage('');
                      }}
                      className={`w-full bg-gradient-to-r ${selectedProductGradient} text-white py-4 rounded-xl font-bold transition-all hover:shadow-lg`}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closePaymentModal}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                <Shield className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">
                  Payments are securely processed by Paystack
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-8">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 flex-shrink-0" />
                    <span className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wider">Order Tracking</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Track Your Order</h2>
                  <p className="text-white/80 text-xs sm:text-sm mt-1">
                    Enter your mobile number to see order status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setTrackedOrders([]);
                    setTrackingNumber('');
                  }}
                  className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                <input
                  type="tel"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter mobile number"
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-base"
                  maxLength={10}
                />
                <button
                  onClick={trackOrder}
                  disabled={isTracking}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 sm:py-4 rounded-xl font-bold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTracking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Track
                    </>
                  )}
                </button>
              </div>

              {/* Tracked Orders List */}
              <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                {trackedOrders.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {trackedOrders.map((order, orderIdx) => (
                      <div key={`order-${order.orderId}-${orderIdx}`} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Order ID</span>
                            <p className="font-bold text-gray-900 text-base sm:text-lg">#{order.orderId}</p>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {order.items.map((item, idx) => (
                          <div key={`item-${order.orderId}-${item.id}-${idx}`} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 border border-gray-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">{item.productName}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{item.productDescription}</p>
                                <p className="text-xs sm:text-sm text-yellow-600 font-semibold mt-1">GHS {item.price?.toFixed(2)}</p>
                              </div>
                              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-wrap">
                                <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                                  {getStatusIcon(item.status)}
                                  {item.status}
                                </div>
                                {item.status?.toLowerCase() === 'completed' && (
                                  <a
                                    href={`https://wa.me/233540277583?text=Hello, I placed an order (Order ID: ${order.orderId}) for ${item.productName} to ${formatPhoneNumber(order.mobileNumber || item.mobileNumber)} the order status shows completed but I have not received the data. Please assist.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    Report Issue
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-flex p-3 sm:p-4 bg-gray-100 rounded-full mb-3 sm:mb-4">
                      <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">Enter your mobile number to track orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="border-t border-gray-200 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Kelishub</h3>
                <p className="text-gray-400 text-xs">Premium Data Shop</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">Secured by Paystack</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Instant Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Kelishub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
