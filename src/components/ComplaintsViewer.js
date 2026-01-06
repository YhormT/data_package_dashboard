import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { Dialog, Transition } from "@headlessui/react";
import { 
  MessageSquareWarning, 
  X, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  MessageCircle
} from "lucide-react";
import Swal from "sweetalert2";

const ComplaintsViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusParam = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axios.get(`${BASE_URL}/api/complaints${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/complaints/pending/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingCount(res.data.data?.count || 0);
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  useEffect(() => {
    if (isOpen) {
      fetchComplaints();
    }
  }, [isOpen, fetchComplaints]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/complaints/${id}`, {
        status: newStatus,
        adminNotes: adminNotes || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Complaint marked as ${newStatus}`,
        timer: 1500
      });

      setSelectedComplaint(null);
      setAdminNotes("");
      fetchComplaints();
      fetchPendingCount();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update complaint status"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Complaint?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Complaint has been deleted",
          timer: 1500
        });

        fetchComplaints();
        fetchPendingCount();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err.response?.data?.message || "Failed to delete complaint"
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "reviewed": return <AlertCircle className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Format phone number for WhatsApp (convert 0XX to 233XX)
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return "233" + cleaned.slice(1);
    }
    if (cleaned.startsWith("233")) {
      return cleaned;
    }
    return "233" + cleaned;
  };

  // Open WhatsApp with pre-filled message
  const openWhatsApp = (complaint) => {
    const whatsappNum = complaint.whatsappNumber || complaint.mobileNumber;
    const formattedNumber = formatWhatsAppNumber(whatsappNum);
    if (!formattedNumber) {
      Swal.fire({
        icon: "warning",
        title: "No Number Available",
        text: "This complaint doesn't have a valid contact number."
      });
      return;
    }
    
    const message = `Hello! This is regarding your complaint (ID: ${complaint.id}) submitted on ${new Date(complaint.createdAt).toLocaleDateString()}.${complaint.orderId ? ` Order ID: ${complaint.orderId}` : ""}\n\nYour complaint: "${complaint.message.slice(0, 100)}${complaint.message.length > 100 ? "..." : ""}"\n\n`;
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Full Clickable Complaints Button */}
      <li
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 p-2 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer w-full"
        title="View Complaints"
      >
        <div className="relative">
          <MessageSquareWarning className="w-5 h-5 text-white" />
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </div>
        <span className="font-medium text-white">Complaints</span>
        {pendingCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </li>

      {/* Complaints Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-orange-500">
                    <div className="flex items-center space-x-3">
                      <MessageSquareWarning className="w-8 h-8 text-white" />
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          Customer Complaints
                        </Dialog.Title>
                        <p className="text-white/80 text-sm">
                          {pendingCount} pending complaint{pendingCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchComplaints}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
                    {["all", "pending", "reviewed", "resolved"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          statusFilter === filter
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Complaints List */}
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquareWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No complaints found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {complaints.map((complaint) => (
                          <div
                            key={complaint.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                    {getStatusIcon(complaint.status)}
                                    {complaint.status}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(complaint.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{complaint.mobileNumber}</span>
                                  </div>
                                  {complaint.whatsappNumber && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <MessageCircle className="w-4 h-4" />
                                      <span>WA: {complaint.whatsappNumber}</span>
                                    </div>
                                  )}
                                  {complaint.orderId && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <FileText className="w-4 h-4" />
                                      <span>Order: {complaint.orderId}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-gray-800 mb-2">{complaint.message}</p>
                                
                                {complaint.adminNotes && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                                    <span className="font-medium text-blue-700">Admin Notes:</span>
                                    <p className="text-blue-600">{complaint.adminNotes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {/* WhatsApp Reply Button */}
                                <button
                                  onClick={() => openWhatsApp(complaint)}
                                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                  title="Reply via WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                                {complaint.status !== "resolved" && (
                                  <button
                                    onClick={() => {
                                      setSelectedComplaint(complaint);
                                      setAdminNotes(complaint.adminNotes || "");
                                    }}
                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                                  >
                                    Update
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(complaint.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Update Status Modal */}
      <Transition appear show={!!selectedComplaint} as={React.Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={() => setSelectedComplaint(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
                    Update Complaint Status
                  </Dialog.Title>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add notes about this complaint..."
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint?.id, "reviewed")}
                      disabled={updatingId === selectedComplaint?.id}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint?.id, "resolved")}
                      disabled={updatingId === selectedComplaint?.id}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ComplaintsViewer;
