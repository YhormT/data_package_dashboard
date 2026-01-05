import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { Megaphone, X, Send, Loader2, MapPin, Users, Globe, Store, UserCheck } from "lucide-react";

const Announcement = ({ onAnnouncementSaved }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("login");
  const [targetAudience, setTargetAudience] = useState("all");

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    if (!loading) {
      setIsOpen(false);
      setTimeout(() => {
        setTitle("");
        setMessage("");
        setTarget("login");
        setTargetAudience("all");
      }, 200);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/announcement/`,
        { title, message, target, targetAudience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Announcement published successfully!");
      setTitle("");
      setMessage("");
      setTarget("login");
      setTargetAudience("all");
      closeModal();
      if (onAnnouncementSaved) onAnnouncementSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save announcement.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen) {
        if (e.key === "Escape" && !loading) closeModal();
        if (e.key === "Enter" && e.ctrlKey && !loading) handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, title, message]);

  const locationOptions = [
    { value: "login", label: "Login Page", icon: <UserCheck className="w-4 h-4" /> },
    { value: "shop", label: "Shop Page", icon: <Store className="w-4 h-4" /> },
    { value: "all", label: "All Pages", icon: <Globe className="w-4 h-4" /> }
  ];

  const audienceOptions = [
    { value: "all", label: "All Users" },
    { value: "shop", label: "Shop Customers" },
    { value: "premium", label: "Premium Agents" },
    { value: "super", label: "Super Agents" },
    { value: "normal", label: "Normal Agents" },
    { value: "other", label: "Other Agents" },
    { value: "user", label: "User Agents" }
  ];

  return (
    <>
      {/* Trigger Button - Full width clickable */}
      <li 
        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors w-full"
        onClick={openModal}
      >
        <Megaphone className="w-5 h-5 text-white" />
        <span className="font-medium text-white">Announcement</span>
      </li>

      {/* Modern Responsive Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {/* Gradient Header */}
                  <div className="bg-sky-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <Dialog.Title className="text-lg sm:text-xl font-bold text-white">
                            New Announcement
                          </Dialog.Title>
                          <p className="text-white/70 text-xs sm:text-sm hidden sm:block">
                            Broadcast your message to users
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        disabled={loading}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Title Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Announcement Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                   transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50
                                   placeholder-gray-400 text-sm sm:text-base"
                        placeholder="Enter a catchy title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                        maxLength={200}
                      />
                      <div className="flex justify-end text-xs text-gray-400 mt-1">
                        <span>{title.length}/200</span>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Message Content
                      </label>
                      <textarea
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl resize-none
                                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                   transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50
                                   placeholder-gray-400 text-sm sm:text-base"
                        placeholder="Write your announcement message..."
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                        maxLength={1000}
                      />
                      <div className="flex justify-end text-xs text-gray-400 mt-1">
                        <span>{message.length}/1000</span>
                      </div>
                    </div>

                    {/* Location Selection - Card Style */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        Display Location
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {locationOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTarget(option.value)}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 ${
                              target === option.value
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                            } disabled:opacity-50`}
                          >
                            <span className={target === option.value ? "text-indigo-500" : "text-gray-400"}>
                              {option.icon}
                            </span>
                            <span className="text-xs sm:text-sm font-medium mt-1">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audience Selection */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Target Audience
                      </label>
                      <select
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                   transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50
                                   text-sm sm:text-base bg-white"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        disabled={loading}
                      >
                        {audienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 hidden sm:block">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-600">Ctrl</kbd>
                      {" + "}
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-600">Enter</kbd>
                      {" to publish"}
                    </div>
                    <div className="flex w-full sm:w-auto space-x-3">
                      <button
                        type="button"
                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-medium text-gray-700 
                                   bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 
                                   focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 
                                   transition-all duration-200 disabled:opacity-50"
                        onClick={closeModal}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2.5
                                  text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600
                                  rounded-xl hover:from-sky-700 hover:to-blue-700
                                  focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                                  transition-all duration-200 disabled:opacity-50 shadow-lg shadow-sky-500/25"
                        onClick={handleSave}
                        disabled={loading || !title.trim() || !message.trim()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Publish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Announcement;