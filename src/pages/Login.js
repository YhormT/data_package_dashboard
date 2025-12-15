import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, User, Lock, Shield, Globe } from "lucide-react";
import AnnouncementBanner from "./AnnouncementBanner";
import { motion } from "framer-motion";

// These would be your actual imports in the real application
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import Premium from "./Premium";
import OtherDashboard from "./OtherDashboard";
import Superagent from "./SuperAgent";
import Normalagent from "./NormalAgent";
import Logo from "../assets/logo-icon.png";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data?.user?.isLoggedIn === false) {
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
        setLoading(false);
        return;
      }

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("isLoggedIn", true);

      // Redirect based on role
      switch (user.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "USER":
          navigate("/user");
          break;
        case "PREMIUM":
          navigate("/premium");
          break;
        case "SUPER":
          navigate("/superagent");
          break;
        case "NORMAL":
          navigate("/normalagent");
          break;
        case "Other":
          navigate("/otherdashboard");
          break;
        default:
          navigate("/login"); // Fallback to landing page
      }
    } catch (err) {
      setLoading(false);

      if (err.response?.status === 403) {
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
      }

      setError("Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rotate-45"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-40 h-40 border-2 border-white"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white rotate-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                KelisHub
              </span>
            </h1>
            <p className="text-xl mb-8 text-indigo-200 leading-relaxed">
              Your trusted platform for seamless data transactions and digital services.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-200">Secure & Trusted Platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-200">24/7 Service Availability</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-200">Personalized Experience</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <img
                src={Logo}
                alt="Logo"
                className="h-20 w-20 rounded-2xl shadow-lg mx-auto mb-4"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 ${
                    focusedField === "email"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 ${
                    focusedField === "password"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>

            {/* Request Account Link */}
            <div className="text-center">
              <a
                href="https://wa.me/233244450003"
                className="inline-flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
              >
                <span>Need an account? Request access</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="hover:text-indigo-600 transition-colors"
              >
                Terms & Conditions
              </button>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-indigo-600 transition-colors"
              >
                Privacy Policy
              </button>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <button
                type="button"
                onClick={() => setShowRefundModal(true)}
                className="hover:text-indigo-600 transition-colors"
              >
                Refund Policy
              </button>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <button
                type="button"
                onClick={() => setShowFaqModal(true)}
                className="hover:text-indigo-600 transition-colors"
              >
                FAQs
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Terms of Use Modal */}
      <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              KELISHUB TERMS AND CONDITIONS & REFUND POLICY
            </Dialog.Title>

            <p className="text-center text-sm text-gray-500 mb-6">
              <span className="italic">Effective Date:</span> 16th December 2025
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Welcome to KelisHub. By using our services, purchasing our products, or accessing our platforms, you agree to be bound by the following Terms and Conditions. Please read them carefully.
            </p>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">1. ABOUT KELISHUB</h3>
                <p className="mb-2">KelisHub is a digital and service-based business that provides:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Data bundles and airtime for all networks</li>
                  <li>Electronics and related devices</li>
                  <li>SIM registration, business registration, birth certificate processing, and other documentation services</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">2. ACCEPTANCE OF TERMS</h3>
                <p className="mb-2">By making a purchase or requesting any service from KelisHub, you confirm that:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You are legally capable of entering into a binding agreement.</li>
                  <li>You have read, understood, and agreed to these Terms and Conditions.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">3. PRICING & PAYMENTS</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All prices are stated in Ghana Cedis (GHS) unless otherwise specified.</li>
                  <li>Full payment must be made before service delivery or processing.</li>
                  <li>KelisHub reserves the right to change prices at any time without prior notice.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">4. SERVICE DELIVERY</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Digital services (data, airtime, etc.) are delivered electronically and are usually processed instantly or within a reasonable time.</li>
                  <li>Physical products will be delivered or handed over as agreed at the time of purchase.</li>
                  <li>Service-based transactions begin once payment is confirmed.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">5. CUSTOMER RESPONSIBILITY</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Customers are responsible for providing accurate details (phone number, network, personal data, documents, etc.).</li>
                  <li>KelisHub will not be held liable for errors resulting from incorrect information provided by the customer.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">6. REFUND POLICY</h3>
                
                <div className="ml-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800">6.1 Digital Products & Services</h4>
                    <p className="text-gray-600 text-xs mb-1">This includes data bundles, airtime, and other digital services.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Digital products are non-refundable once successfully delivered.</li>
                      <li>Refunds will only be considered if:</li>
                      <ul className="list-disc list-inside ml-6 space-y-1">
                        <li>Payment was successful but the service was not delivered.</li>
                        <li>A verified system error occurred on KelisHub's side.</li>
                      </ul>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">6.2 Incorrect Details</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>KelisHub is not responsible for transactions completed using incorrect details provided by the customer.</li>
                      <li>Such transactions are not eligible for refunds.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">6.3 Delayed Transactions</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Delays caused by network providers or third-party systems do not automatically qualify for refunds.</li>
                      <li>Refunds will only be processed if the transaction fails completely and is reversed.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">6.4 Physical Products (Electronics & Devices)</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Physical items may be eligible for a refund or replacement within 24 hours of purchase if:</li>
                      <ul className="list-disc list-inside ml-6 space-y-1">
                        <li>The item is confirmed to be defective at delivery.</li>
                        <li>It is returned in its original condition and packaging.</li>
                      </ul>
                      <li>Items damaged due to misuse, mishandling, or negligence are not refundable.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">6.5 Service-Based Transactions</h4>
                    <p className="text-gray-600 text-xs mb-1">This includes SIM registration, business certificates, birth certificates, and documentation services.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Once processing has begun, no refunds will be issued.</li>
                      <li>Refunds may only be considered if KelisHub is unable to initiate the service.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800">6.6 Refund Processing</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Approved refunds will be processed within 24 hours.</li>
                      <li>Refunds will be made via the original payment method used.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">7. LIMITATION OF LIABILITY</h3>
                <p className="mb-2">KelisHub shall not be liable for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Network failures or third-party service interruptions.</li>
                  <li>Losses resulting from customer negligence or incorrect information.</li>
                  <li>Indirect or consequential damages beyond the value of the purchased service or product.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">8. FRAUD & MISUSE</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Any fraudulent activity, chargeback abuse, or misuse of our services will result in immediate suspension and possible legal action.</li>
                  <li>KelisHub reserves the right to refuse service to anyone found violating these terms.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">9. MODIFICATIONS TO TERMS</h3>
                <p>KelisHub reserves the right to modify these Terms and Conditions at any time. Continued use of our services constitutes acceptance of the updated terms.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">10. GOVERNING LAW</h3>
                <p>These Terms and Conditions are governed by and interpreted in accordance with the laws of the Republic of Ghana.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">11. CONTACT INFORMATION</h3>
                <p className="mb-2">For inquiries, complaints, or refund-related issues, contact us via:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Website: <a href="https://kelishub.vercel.app/" className="text-indigo-500 underline">https://kelishub.vercel.app/</a></li>
                  <li>Customer Support: <span className="text-indigo-600">+233596316991</span></li>
                  <li>Complaints: <span className="text-indigo-600">+23324883004</span> (WhatsApp only)</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              Privacy Policy for KelisHub
            </Dialog.Title>

            <p className="text-center text-sm text-gray-500 mb-6">
              <span className="italic">Effective Date:</span> 01/06/2025
            </p>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">1. Information We Collect</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Personal Information:</strong> Name, phone number, email address, and network provider.</li>
                  <li><strong>Transaction Information:</strong> Data bundle purchases, payment methods (e.g., MoMo – not stored), and transaction history.</li>
                  <li><strong>Device Information:</strong> IP address, device type, browser type, and location data (for security and optimization).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Process your data bundle orders.</li>
                  <li>Communicate with you regarding purchases, updates, or issues.</li>
                  <li>Improve our services and customer experience.</li>
                  <li>Prevent fraud and ensure account security.</li>
                  <li>Send promotional messages (optional; opt-out available).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">3. Data Sharing</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>We don't sell or share your personal data, except:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>With trusted service providers (e.g., payment gateways).</li>
                    <li>When legally required.</li>
                    <li>To prevent fraud or protect users and our platform.</li>
                  </ul>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">4. Data Security</h3>
                <p>We use reasonable industry-standard practices to protect your data. While no system is perfectly secure, we do our best to keep your information safe.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">5. Your Rights</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access, update, or delete your personal information.</li>
                  <li>Opt-out of promotional messages.</li>
                  <li>Request us to stop processing your data (with business/legal limitations).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">6. Cookies & Tracking</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Used to enhance browsing, remember preferences, and track site traffic.</li>
                  <li>You can disable cookies in your browser settings.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">7. Third-Party Links</h3>
                <p>Links to third-party websites may exist. We are not responsible for their content or privacy practices.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">8. Changes to This Policy</h3>
                <p>This policy may be updated periodically. Changes will be reflected with a revised effective date.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">9. Contact Us</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email: <a href="mailto:kelisdata22@gmail.com" className="text-indigo-500 underline">kelisdata22@gmail.com</a></li>
                  <li>Phone: <span className="text-indigo-600">0244450003</span></li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Refund Policy Modal */}
      <Dialog open={showRefundModal} onClose={() => setShowRefundModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              Refund Policy for KelisHub
            </Dialog.Title>

            <p className="text-center text-sm text-gray-500 mb-6">
              <span className="italic">Effective Date:</span> 01/06/2025
            </p>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">1. Overview</h3>
                <p>At KelisHub, we strive to provide reliable and efficient data bundle services. We understand that issues may occasionally arise, and we are committed to resolving them fairly. This Refund Policy outlines the conditions under which refunds may be granted.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">2. Eligibility for Refunds</h3>
                <p className="mb-2">Refunds may be considered under the following circumstances:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Failed Transactions:</strong> If payment was deducted but the data bundle was not delivered due to a system error on our end.</li>
                  <li><strong>Duplicate Payments:</strong> If you were charged multiple times for the same order.</li>
                  <li><strong>Service Unavailability:</strong> If the service was unavailable and we were unable to fulfill your order within a reasonable timeframe.</li>
                  <li><strong>Incorrect Order:</strong> If you received a different data bundle than what was ordered (subject to verification).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">3. Non-Refundable Situations</h3>
                <p className="mb-2">Refunds will NOT be granted in the following cases:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Data bundles that have been successfully delivered and activated.</li>
                  <li>Orders placed with incorrect phone numbers provided by the customer.</li>
                  <li>Change of mind after a successful transaction.</li>
                  <li>Network issues on the customer's mobile carrier that prevent data usage.</li>
                  <li>Expired data bundles due to non-usage within the validity period.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">4. Refund Request Process</h3>
                <p className="mb-2">To request a refund:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Timing:</strong> Refund requests are processed on <strong>Sundays only</strong>.</li>
                  <li><strong>Required Information:</strong> You must provide your Order ID, data size, mobile number, and a brief description of the issue.</li>
                  <li><strong>Contact:</strong> Submit your request via WhatsApp at <span className="text-indigo-600">0244450003</span> or email <a href="mailto:kelisdata22@gmail.com" className="text-indigo-500 underline">kelisdata22@gmail.com</a>.</li>
                  <li><strong>Processing Time:</strong> Approved refunds will be processed within 3-5 business days.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">5. Refund Methods</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Account Credit:</strong> Refunds are typically credited to your KelisHub account balance for future purchases.</li>
                  <li><strong>Mobile Money:</strong> In exceptional cases, refunds may be sent to your registered mobile money number.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">6. Dispute Resolution</h3>
                <p>If you are not satisfied with the outcome of your refund request, you may escalate the matter by contacting our support team. We will review your case and provide a final decision within 7 business days.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">7. Changes to This Policy</h3>
                <p>KelisHub reserves the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated effective date.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">8. Contact Us</h3>
                <p>For refund inquiries or assistance:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email: <a href="mailto:kelisdata22@gmail.com" className="text-indigo-500 underline">kelisdata22@gmail.com</a></li>
                  <li>WhatsApp: <span className="text-indigo-600">0244450003</span></li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* FAQs Modal */}
      <Dialog open={showFaqModal} onClose={() => setShowFaqModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              Frequently Asked Questions (FAQs)
            </Dialog.Title>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">1. What is KelisHub?</h3>
                <p>KelisHub is a trusted online platform for purchasing affordable data bundles for MTN, AirtelTigo, and Telecel networks in Ghana. We provide fast, reliable, and secure data bundle services.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">2. How do I purchase data bundles?</h3>
                <p>Simply log into your KelisHub account, select the data bundle you want, enter the recipient's phone number, and complete the payment. Your data will be delivered instantly.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">3. What payment methods do you accept?</h3>
                <p>We accept Mobile Money (MTN MoMo, AirtelTigo Money, Telecel Cash) and card payments through our secure payment gateway powered by Paystack.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">4. How long does it take to receive my data bundle?</h3>
                <p>Data bundles are typically delivered within 1-5 minutes after successful payment. During peak hours, delivery may take up to 15 minutes.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">5. What if I don't receive my data bundle?</h3>
                <p>If you don't receive your data within 15 minutes, please contact our support team via WhatsApp at 0244450003 with your Order ID and payment confirmation.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">6. Can I get a refund?</h3>
                <p>Yes, refunds are available for failed transactions, duplicate payments, or service errors. Please refer to our Refund Policy for detailed information. Refund requests are processed on Sundays.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">7. Is my payment information secure?</h3>
                <p>Absolutely! We use Paystack, a PCI-DSS compliant payment processor, to handle all transactions. We never store your card details or mobile money PIN on our servers.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">8. What are your operating hours?</h3>
                <p>Our platform is available 24/7 for placing orders. Customer support is available from 7:30 AM to 8:50 PM, Monday to Saturday.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">9. How do I create an account?</h3>
                <p>To create an account, contact our registration agent via WhatsApp at 0244450003. Account creation is by invitation to maintain service quality.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">10. How can I contact customer support?</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>WhatsApp: <span className="text-indigo-600">0244450003</span></li>
                  <li>Email: <a href="mailto:kelisdata22@gmail.com" className="text-indigo-500 underline">kelisdata22@gmail.com</a></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">11. Do you offer bulk data purchases?</h3>
                <p>Yes! We offer special rates for bulk purchases and resellers. Contact our support team for more information on bulk pricing.</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">12. Can I track my orders?</h3>
                <p>Yes, you can track all your orders in your dashboard. Each order has a unique Order ID and status that you can monitor.</p>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowFaqModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;