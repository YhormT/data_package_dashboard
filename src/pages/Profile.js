import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, ArrowLeft, Shield, Phone, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    createdAt: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setPageLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in again.',
        });
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUser(response.data);
        setFormData(prev => ({
          ...prev,
          name: response.data.name,
          email: response.data.email
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile information.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleBackToDashboard = () => {
    const userRole = localStorage.getItem('role');
    
    switch (userRole) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'USER':
        navigate('/user');
        break;
      case 'PREMIUM':
        navigate('/premium');
        break;
      case 'SUPER':
        navigate('/superagent');
        break;
      case 'NORMAL':
        navigate('/normalagent');
        break;
      case 'Other':
        navigate('/otherdashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in again.',
        });
        setLoading(false);
        return;
      }

      if (!formData.name.trim() || !formData.email.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Name and email are required.',
        });
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please enter a valid email address.',
        });
        setLoading(false);
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      const response = await axios.put(`${BASE_URL}/api/users/${userId}/profile`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email
        }));

        if (formData.email !== user.email) {
          localStorage.setItem('userEmail', formData.email);
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile updated successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in again.',
        });
        setLoading(false);
        return;
      }

      if (!formData.newPassword || !formData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all password fields.',
        });
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'New passwords do not match.',
        });
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Password must be at least 6 characters long.',
        });
        setLoading(false);
        return;
      }

      const response = await axios.put(`${BASE_URL}/api/users/${userId}/updatePassword`, {
        newPassword: formData.newPassword
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Password updated successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-100 text-red-700 border-red-200';
      case 'PREMIUM': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SUPER': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'NORMAL': return 'bg-green-100 text-green-700 border-green-200';
      case 'USER': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600 pt-8 pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-white/90 
                       bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 
                       transition-all duration-200 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl 
                              flex items-center justify-center border-2 border-white/30 shadow-xl">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full 
                              border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {user.name || 'Loading...'}
              </h1>
              <p className="text-white/80 text-sm sm:text-base mb-3">{user.email}</p>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold 
                               rounded-full border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Overlapping Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Account Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Account Details</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{user.phone || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Account Type</p>
                    <p className="text-sm font-medium text-gray-900">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-100">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-all duration-200 
                               border-b-2 ${activeTab === 'profile'
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-all duration-200 
                               border-b-2 ${activeTab === 'password'
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Security
                  </button>
                </nav>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                                     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                                     transition-all duration-200 text-gray-900"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                                     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                                     transition-all duration-200 text-gray-900"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 text-sm font-medium text-white 
                                   bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl 
                                   hover:from-sky-700 hover:to-blue-700 
                                   focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 
                                   disabled:opacity-50 disabled:cursor-not-allowed 
                                   transition-all duration-200 shadow-lg shadow-sky-500/25"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="p-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500 mt-1">Ensure your account is using a strong password</p>
                  </div>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl 
                                     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                                     transition-all duration-200 text-gray-900"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl 
                                     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                                     transition-all duration-200 text-gray-900"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-800">Password Requirements</h4>
                          <ul className="mt-2 text-sm text-amber-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${formData.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-300'}`} />
                              At least 6 characters long
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${formData.newPassword && formData.newPassword === formData.confirmPassword ? 'text-green-500' : 'text-gray-300'}`} />
                              Both passwords must match
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 text-sm font-medium text-white 
                                   bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl 
                                   hover:from-sky-700 hover:to-blue-700 
                                   focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 
                                   disabled:opacity-50 disabled:cursor-not-allowed 
                                   transition-all duration-200 shadow-lg shadow-sky-500/25"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
