import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { Dialog, Transition } from "@headlessui/react";
import { MessageSquareWarning, X, Send, Loader2, Phone, FileText, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";

const ComplaintModal = ({ isOpen, onClose }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mobileNumber.trim() || !message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Mobile number and complaint message are required.",
      });
      return;
    }

    if (mobileNumber.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Number",
        text: "Please enter a valid mobile number.",
      });
      return;
    }

    if (whatsappNumber && whatsappNumber.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid WhatsApp Number",
        text: "Please enter a valid WhatsApp number or leave it empty.",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/complaints`, {
        mobileNumber,
        whatsappNumber: whatsappNumber || null,
        orderId: orderId || null,
        message,
      });

      Swal.fire({
        icon: "success",
        title: "Complaint Submitted",
        text: "Your complaint has been submitted successfully. We will review it shortly.",
      });

      setMobileNumber("");
      setWhatsappNumber("");
      setOrderId("");
      setMessage("");
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.message || "Failed to submit complaint. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MessageSquareWarning className="w-6 h-6 text-red-600" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      File a Complaint
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Mobile Number Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 placeholder-gray-400"
                      placeholder="Enter your mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      disabled={loading}
                      maxLength={10}
                    />
                  </div>

                  {/* WhatsApp Number Input (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 placeholder-gray-400"
                      placeholder="Enter WhatsApp number for replies"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                      disabled={loading}
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll use this to reply to your complaint</p>
                  </div>

                  {/* Order ID Input (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4" />
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 placeholder-gray-400"
                      placeholder="Enter order ID if applicable"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* Complaint Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint Message *
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 placeholder-gray-400"
                      placeholder="Describe your complaint in detail..."
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                      maxLength={1000}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Please provide as much detail as possible</span>
                      <span>{message.length}/1000</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100 space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                    onClick={handleSubmit}
                    disabled={loading || !mobileNumber.trim() || !message.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Complaint
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ComplaintModal;
