import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, Phone, Mail, MapPin, Star, Shield, Zap, Clock, ChevronLeft, ChevronRight, Wifi, Globe, Smartphone } from 'lucide-react';
import { Dialog } from "@headlessui/react";
import Logo from "../assets/logo-icon.png";

const KelishubLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    const timer = setTimeout(() => setIsLoading(false), 1000);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const networks = [
    { name: 'MTN', color: 'bg-yellow-500', features: ['Instant Activation', 'No Expiry Dates', 'Data Rollover', '4G/5G Support'] },
    { name: 'TELECEL', color: 'bg-red-500', features: ['Lightning Fast', 'Nationwide Coverage', 'Bonus Data', 'Easy Top-up'] },
    { name: 'AIRTELTIGO', color: 'bg-blue-600', features: ['Best Value', 'Quick Delivery', 'Flexible Plans', 'Great Coverage'] }
  ];

  const testimonials = [
    { name: 'Kwame Asante', role: 'Student', content: 'Kelishub has been my go-to for data packages. Fast, reliable, and affordable prices!', rating: 5 },
    { name: 'Ama Serwaa', role: 'Business Owner', content: 'Excellent service! I buy data for my entire team through Kelishub. Never disappointed.', rating: 5 },
    { name: 'Kofi Mensah', role: 'Freelancer', content: 'Quick delivery and great customer support. Highly recommend Kelishub for all data needs.', rating: 5 },
    { name: 'Akosua Frimpong', role: 'Teacher', content: 'Reliable service that keeps me connected with my students. Great customer experience!', rating: 5 }
  ];

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 4000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-white border-opacity-30 rounded-full mx-auto"></div>
          </div>
          <div className="text-white text-2xl font-bold mb-2 animate-pulse">Kelishub</div>
          <div className="text-white text-sm animate-pulse">Loading your data experience...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/30 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={Logo} alt="Kelishub Logo" className="h-10 w-10 mr-3" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={() => window.location.href = "#home"} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>Home</button>
                <button onClick={() => window.location.href = "#about"} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>About</button>
                <button onClick={() => window.location.href = "#services"} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>Services</button>
                <button onClick={() => window.location.href = "#packages"} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>Packages</button>
                <button onClick={() => window.location.href = "#testimonials"} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>Testimonials</button>
                <a href="https://wa.me/233244450003" target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>Contact</a>
                <a href="/shop" className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors">Shop</a>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className={`focus:outline-none transition-colors ${scrolled ? 'text-black-700 hover:text-yellow-500' : 'text-black hover:text-yellow-200'}`}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => window.location.href = "#home"} className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">Home</button>
              <button onClick={() => window.location.href = "#about"} className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">About</button>
              <button onClick={() => window.location.href = "#services"} className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">Services</button>
              <button onClick={() => window.location.href = "#packages"} className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">Packages</button>
              <button onClick={() => window.location.href = "#testimonials"} className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">Testimonials</button>
              <a href="https://wa.me/233244450003" target="_blank" rel="noopener noreferrer" className="text-black-700 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium">Contact</a>
              <a href="/shop" className="bg-yellow-500 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-yellow-600">Shop</a>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="pt-16 bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-red-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
          <div className="absolute top-60 left-1/3 w-8 h-8 bg-yellow-500 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-6 h-6 bg-orange-500 rounded-full opacity-30 animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Trusted<span className="text-yellow-500"> Data Package</span><br />Dealer
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get instant data bundles for MTN, TELECEL, and AIRTELTIGO at unbeatable prices. Fast, reliable, and convenient - your connectivity is our priority.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => window.location.href = "/Login"} className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">Buy Data Now</button>
                <button onClick={() => window.location.href = "#about"} className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 hover:text-white transition-all">Learn More</button>
              </div>
            </div>
            <div className="relative perspective-1000">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform-gpu transition-all duration-700 hover:rotate-y-12 hover:scale-105 animate-float">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-500 h-16 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer"><span className="text-white font-bold">MTN</span></div>
                  <div className="bg-red-500 h-16 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer"><span className="text-white font-bold">TELECEL</span></div>
                  <div className="bg-blue-600 h-16 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer"><span className="text-white font-bold text-xs">AIRTELTIGO</span></div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">All Networks</h3>
                  <p className="text-gray-600">One platform, all your favorite networks</p>
                </div>
                <div className="absolute -top-6 -left-6 bg-blue-500 p-3 rounded-full text-white animate-spin-slow"><Wifi className="h-6 w-6" /></div>
                <div className="absolute -bottom-6 -right-6 bg-green-500 p-3 rounded-full text-white animate-spin-slow" style={{ animationDelay: '1s' }}><Globe className="h-6 w-6" /></div>
                <div className="absolute -top-6 -right-6 bg-purple-500 p-3 rounded-full text-white animate-spin-slow" style={{ animationDelay: '2s' }}><Smartphone className="h-6 w-6" /></div>
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-500 text-white px-4 py-2 rounded-full font-bold animate-bounce z-10">24/7 Service</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Kelishub?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">We provide the best data package deals with exceptional service quality</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-all transform hover:scale-105 hover:shadow-lg">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform"><Zap className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your data bundles delivered instantly to your phone</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all transform hover:scale-105 hover:shadow-lg">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform"><Shield className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">Safe and secure payment methods for your peace of mind</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-all transform hover:scale-105 hover:shadow-lg">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform"><Clock className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support whenever you need us</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all transform hover:scale-105 hover:shadow-lg">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform"><Star className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive prices that give you the best value for money</p>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Data Packages</h2>
            <p className="text-xl text-gray-600">Choose from our wide range of affordable data packages</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {networks.map((network, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                <div className={`${network.color} h-4`}></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{network.name}</h3>
                  <div className="space-y-3">
                    {network.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => window.location.href = "/Login"} className="w-full mt-6 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all transform hover:scale-105">Buy {network.name} Data</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About Kelishub</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">Kelishub is Ghana's premier data package dealer, committed to keeping you connected with affordable and reliable internet bundles. We've built our reputation on trust, speed, and exceptional customer service.</p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">Since our inception, we've served thousands of customers across Ghana, providing instant data bundle top-ups for all major networks including MTN, TELECEL, and AIRTELTIGO.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center"><div className="text-3xl font-bold text-yellow-500 mb-2">5000+</div><div className="text-gray-600">Happy Customers</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-yellow-500 mb-2">99.9%</div><div className="text-gray-600">Success Rate</div></div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white transform hover:scale-105 transition-transform">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg leading-relaxed">To provide fast, reliable, and affordable data packages that keep Ghana connected. We believe everyone deserves access to affordable internet connectivity.</p>
                <div className="mt-6 flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4"><Phone className="h-6 w-6" /></div>
                  <span className="font-semibold">Always Connected, Always Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 mx-4 text-center">
                      <div className="flex justify-center items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />))}
                      </div>
                      <p className="text-gray-600 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                      <div className="flex items-center justify-center">
                        <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">{testimonial.name.charAt(0)}</div>
                        <div className="text-left"><h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4><p className="text-gray-500">{testimonial.role}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={prevTestimonial} className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"><ChevronLeft className="h-6 w-6 text-gray-600" /></button>
            <button onClick={nextTestimonial} className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"><ChevronRight className="h-6 w-6 text-gray-600" /></button>
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (<button key={index} onClick={() => setCurrentTestimonial(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-yellow-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Stay Connected?</h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers and get your data bundles instantly</p>
          <button onClick={() => window.location.href = "/login"} className="bg-white text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">Start Buying Data Now</button>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4"><img src={Logo} alt="Kelishub Logo" className="h-10 w-10 mr-3" /><span className="text-2xl font-bold">Kelishub</span></div>
              <p className="text-gray-300 mb-6 max-w-md">Your trusted partner for affordable data packages across all major networks in Ghana. Keeping you connected, always.</p>
              <div className="flex space-x-4">
                <a href="https://wa.me/233596316991" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
                <button onClick={() => setShowTermsModal(true)} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">Terms of Service</button>
                <button onClick={() => setShowPrivacyModal(true)} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">Privacy Policy</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-yellow-500 transition-colors">Home</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-yellow-500 transition-colors">About Us</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-yellow-500 transition-colors">Services</a></li>
                <li><a href="#packages" className="text-gray-300 hover:text-yellow-500 transition-colors">Data Packages</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center"><Phone className="h-5 w-5 text-yellow-500 mr-3" /><span className="text-gray-300">+233 59 631 6991</span></div>
                <div className="flex items-center"><Mail className="h-5 w-5 text-yellow-500 mr-3" /><span className="text-gray-300">yormborlee@gmail.com</span></div>
                <div className="flex items-center"><MapPin className="h-5 w-5 text-yellow-500 mr-3" /><span className="text-gray-300">Accra, Ghana</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center"><p className="text-gray-300">&copy; 2024 Kelishub. All rights reserved.</p></div>
        </div>
      </footer>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform-style: preserve-3d; }
        .rotate-y-12:hover { transform: rotateY(12deg); }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
      `}</style>

      <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-yellow-600 mb-4 text-center">KELISHUB TERMS AND CONDITIONS & REFUND POLICY</Dialog.Title>
            <p className="text-center text-sm text-gray-500 mb-6"><span className="italic">Effective Date:</span> 16th December 2025</p>
            <p className="text-sm text-gray-600 mb-4">Welcome to KelisHub. By using our services, purchasing our products, or accessing our platforms, you agree to be bound by the following Terms and Conditions.</p>
            <div className="space-y-4 text-sm text-gray-700">
              <section><h3 className="font-semibold text-gray-800 mb-2">1. ABOUT KELISHUB</h3><p>KelisHub provides data bundles, airtime, electronics, SIM registration, and documentation services.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">2. PRICING & PAYMENTS</h3><p>All prices are in Ghana Cedis (GHS). Full payment required before delivery. Prices may change without notice.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">3. REFUND POLICY</h3><p>Digital products are non-refundable once delivered. Refunds considered only if service was not delivered or system error occurred.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">4. CONTACT</h3><p>Customer Support: +233596316991 | Website: kelishub.vercel.app</p></section>
            </div>
            <div className="mt-6 text-center"><button onClick={() => setShowTermsModal(false)} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Close</button></div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-yellow-600 mb-4 text-center">Privacy Policy for KelisHub</Dialog.Title>
            <p className="text-center text-sm text-gray-500 mb-6"><span className="italic">Effective Date:</span> 01/06/2025</p>
            <div className="space-y-4 text-sm text-gray-700">
              <section><h3 className="font-semibold text-gray-800 mb-2">1. Information We Collect</h3><p>Personal info (name, phone, email), transaction info, and device info for security.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">2. How We Use Your Information</h3><p>To process orders, communicate with you, improve services, and prevent fraud.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">3. Data Security</h3><p>We use industry-standard practices to protect your data.</p></section>
              <section><h3 className="font-semibold text-gray-800 mb-2">4. Contact Us</h3><p>Email: kelisdata22@gmail.com | Phone: 0244450003</p></section>
            </div>
            <div className="mt-6 text-center"><button onClick={() => setShowPrivacyModal(false)} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Close</button></div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default KelishubLanding;
