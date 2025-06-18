import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Sparkles, CheckCircle, Mail, Lock } from "lucide-react";
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

// Mock implementations for demo purposes

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Using state instead of localStorage for demo - in real app use: localStorage.getItem("role") || null
  // const [userRole, setUserRole] = useState(null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // In real app, this would check localStorage
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
      // In real app: const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // ✅ If user already logged in somewhere else
      if (res.data?.user?.isLoggedIn === false) {
        // In real app: toast.warn("This account is currently in use. Please log out from other devices.");
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
        setLoading(false);
        return;
      }

      // ✅ Normal successful login
      const { token, user } = res.data;

      // In real app, uncomment these:
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("isLoggedIn", true);
      // In real app: toast.success("Login successful!");
      toast.success("Login successful!");

      setTimeout(() => {
        setUserRole(user.role);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);

      // 🔇 Don't log to console unless debugging
      // console.error(err);  // <-- REMOVE or comment this out in production

      if (err.response?.status === 403) {
        // In real app: toast.warn("This account is currently in use. Please log out from other devices.");
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
      } else {
        // In real app: toast.error("Invalid email or password");
        toast.error("Invalid email or password");
      }

      setError("Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Route to appropriate dashboard based on user role
  if (userRole === "ADMIN") {
    return <AdminDashboard setUserRole={setUserRole} />;
  } else if (userRole === "USER") {
    return <UserDashboard setUserRole={setUserRole} userRole={userRole} />;
  } else if (userRole === "PREMIUM") {
    return <Premium setUserRole={setUserRole} userRole={userRole} />;
  } else if (userRole === "SUPERAGENT") {
    return <Superagent setUserRole={setUserRole} userRole={userRole} />;
  } else if (userRole === "NORMALAGENT") {
    return <Normalagent setUserRole={setUserRole} userRole={userRole} />;
  } else if (userRole === "Other") {
    return <OtherDashboard setUserRole={setUserRole} userRole={userRole} />;
  }

  return (
    //<div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.1),rgba(147,51,234,0.1),rgba(236,72,153,0.1),rgba(59,130,246,0.1))] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]">
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.1),rgba(147,51,234,0.1),rgba(236,72,153,0.1),rgba(59,130,246,0.1))] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]">
      {/* Framer Motion Bubble Animation from old code */}
      {/* these codes where commented out for performance reasons */}
      {/* {[...Array(20)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute bg-white opacity-20 rounded-full"
          style={{
            width: `${Math.random() * 40 + 10}px`,
            height: `${Math.random() * 40 + 10}px`,
            bottom: `${-Math.random() * 50}px`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-50, -600],
            opacity: [0.5, 1, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))} */}

      {/* Enhanced Floating Particles */}
      {/* {[...Array(30)].map((_, index) => {
        const size = Math.random() * 6 + 2;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 15;
        const initialY = Math.random() * 100;
        const initialX = Math.random() * 100;
        return (
          <div
            key={`particle-${index}`}
            className="absolute pointer-events-none opacity-60"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${initialX}%`,
              top: `${initialY}%`,
              animation: `float-${index} ${duration}s ${delay}s infinite linear`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm animate-pulse" />
          </div>
        );
      })} */}

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Premium Announcement Banner */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 overflow-hidden z-20">
        <div className="flex items-center h-full">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center whitespace-nowrap text-white font-semibold text-sm"
          >
            <div className="flex items-center space-x-8 px-8">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>🎉 ANNOUNCEMENT • ANNOUNCEMENT • ANNOUNCEMENT</span>
              </span>
              <span>•</span>
              <span>✨ PREMIUM DASHBOARD UPDATES</span>
              <span>•</span>
              <span>🚀 ENHANCED SECURITY</span>
              <span>•</span>
              <span>
                💎✌ PLEASE REMEMBER TO LOGOUT BEFORE CLOSING YOUR TAB!!!
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4 z-10"
      >
        {/* Card with glassmorphism effect */}
        <div className="relative p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          {/* Blue shape decoration from old code */}
          <div className="absolute left-8 top-1/4 w-32 h-32 bg-blue-500 rounded-full opacity-60 blur-xl"></div>
          <div className="absolute left-12 top-1/3 w-36 h-36 bg-teal-500 rounded-full opacity-40 blur-xl"></div>

          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-75" />

          <div className="relative z-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                {/* In real app, replace this div with: <img src={Logo} alt="Logo" className="h-[130px] w-[130px] rounded-full" /> */}
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-[130px] w-[130px] rounded-full"
                />
                {/* <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    
                    <img
                      src={Logo}
                      alt="Logo"
                      className="h-[100px] w-[130px] rounded-full"
                    />
                  </div>
                </div> 
                {/* Floating rings around logo */}
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping" />
                <div
                  className="absolute inset-0 rounded-full border border-yellow-400/20 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
              <p className="text-yellow-300 text-lg">Welcome Back!</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-red-200 text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-300 flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                        focusedField === "email"
                          ? "border-cyan-400 shadow-lg shadow-cyan-400/25"
                          : "border-white/20 hover:border-white/30"
                      }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                    {focusedField === "email" && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-300 flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none pr-12 ${
                        focusedField === "password"
                          ? "border-cyan-400 shadow-lg shadow-cyan-400/25"
                          : "border-white/20 hover:border-white/30"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {focusedField === "password" && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 pointer-events-none" />
                    )}
                  </div>
                  {password && (
                    <p className="text-xs text-green-400 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Password strength: Strong</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </span>
                  )}

                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <a
                  href="https://wa.me/233244450003"
                  className="inline-flex items-center space-x-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors group"
                >
                  <span>Request An Account</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>

              {/* <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Terms of use
                </a>
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Privacy policy
                </a>
              </div> */}
              <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms of use
                </button>
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms of Use Modal */}
      <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-blue-600 mb-4 text-center">
              KELISHUB – TERMS OF USE
            </Dialog.Title>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  1. DEPOSIT
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    The minimum deposit amount is{" "}
                    <span className="font-medium">GHS 50</span>. Deposits below
                    this amount will not be approved.
                  </li>
                  <li>All payments should be made to:</li>
                  <ul className="ml-6">
                    <li>
                      Number: <span className="text-blue-600">0596316991</span>
                    </li>
                    <li>
                      Name:{" "}
                      <span className="text-purple-600">
                        Yesu Yhorm Kafui Azago
                      </span>
                    </li>
                  </ul>
                  <li>
                    If your top-up does not reflect within 10 minutes, kindly
                    contact an admin for immediate assistance.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  2. LOAN
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    You are eligible to request a loan up to the total amount
                    you’ve deposited.
                  </li>
                  <li>Only one loan request is permitted per day.</li>
                  <li>
                    A loan that is cleared within the day cannot be requested
                    again on the same day.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  3. REFERRALS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    To refer a friend, simply share the link:{" "}
                    <a
                      href="https://www.kelishub.com"
                      className="text-blue-500 underline"
                    >
                      www.kelishub.com
                    </a>
                    .
                  </li>
                  <li>
                    New users will be guided to contact the official
                    registration agent.
                  </li>
                  <li>
                    Only recommend hardworking and trustworthy individuals to
                    maintain community quality.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  4. WORKING HOURS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Operating hours are from{" "}
                    <span className="font-medium">7:30 AM to 8:50 PM</span>,
                    Monday to Saturday.
                  </li>
                  <li>
                    Orders can be placed anytime but will be processed only
                    during working hours.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  5. PROMOTIONS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Promotions may be introduced at any time for:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>100GB bundles</li>
                    <li>Tigo non-expiry packages</li>
                    <li>MTN bundles</li>
                  </ul>
                  <li>
                    Check the site regularly for updates on deals and prices.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  6. REFUNDS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refund requests are handled only on Sundays.</li>
                  <li>You must present the following details:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Order ID</li>
                    <li>Data size</li>
                  </ul>
                </ul>
              </section>

              <p className="italic text-gray-500 border-t pt-4">
                If you need clarification on any of these rules, feel free to
                contact an admin. Thank you for being a valued member of the
                Kelishub community.
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-blue-600 mb-4 text-center">
              Privacy Policy for KelisHub
            </Dialog.Title>

            <p className="text-center text-sm text-gray-500 mb-6">
              <span className="italic">Effective Date:</span> 01/06/2025
            </p>

            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  1. Information We Collect
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Personal Information:</strong> Name, phone number,
                    email address, and network provider.
                  </li>
                  <li>
                    <strong>Transaction Information:</strong> Data bundle
                    purchases, payment methods (e.g., MoMo – not stored), and
                    transaction history.
                  </li>
                  <li>
                    <strong>Device Information:</strong> IP address, device
                    type, browser type, and location data (for security and
                    optimization).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Process your data bundle orders.</li>
                  <li>
                    Communicate with you regarding purchases, updates, or
                    issues.
                  </li>
                  <li>Improve our services and customer experience.</li>
                  <li>Prevent fraud and ensure account security.</li>
                  <li>
                    Send promotional messages (optional; opt-out available).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  3. Data Sharing
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>We don’t sell or share your personal data, except:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>
                      With trusted service providers (e.g., payment gateways).
                    </li>
                    <li>When legally required.</li>
                    <li>To prevent fraud or protect users and our platform.</li>
                  </ul>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  4. Data Security
                </h3>
                <p>
                  We use reasonable industry-standard practices to protect your
                  data. While no system is perfectly secure, we do our best to
                  keep your information safe.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  5. Your Rights
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access, update, or delete your personal information.</li>
                  <li>Opt-out of promotional messages.</li>
                  <li>
                    Request us to stop processing your data (with business/legal
                    limitations).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  6. Cookies & Tracking
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Used to enhance browsing, remember preferences, and track
                    site traffic.
                  </li>
                  <li>You can disable cookies in your browser settings.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  7. Third-Party Links
                </h3>
                <p>
                  Links to third-party websites may exist. We are not
                  responsible for their content or privacy practices.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  8. Changes to This Policy
                </h3>
                <p>
                  This policy may be updated periodically. Changes will be
                  reflected with a revised effective date.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  9. Contact Us
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:kelisdata22@gmail.com"
                      className="text-blue-500 underline"
                    >
                      kelisdata22@gmail.com
                    </a>
                  </li>
                  <li>
                    Phone: <span className="text-blue-600">0244450003</span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
