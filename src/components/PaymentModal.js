import React, { useState, Fragment, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../endpoints/endpoints";
import { BadgeCent, Download } from "lucide-react";

const truncateMessage = (message, limit = 50) => {
  if (message.length <= limit) return message;
  return message.slice(0, limit) + "...";
};

const PaymentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const prevDataRef = useRef([]);

  const fetchMessages = async (showToast = false) => {
    try {
      const response = await axios.get(BASE_URL + "/api/sms/payment-received");
      const newData = response.data?.data || [];

      // Compare old vs new for new messages
      const oldIds = new Set(prevDataRef.current.map((d) => d.id));
      const newMessages = newData.filter((msg) => !oldIds.has(msg.id));

      if (newMessages.length > 0 && showToast) {
        toast.info(`🔔 ${newMessages.length} new payment message(s) received`);
      }

      setPaymentData({ data: newData });
      prevDataRef.current = newData;
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch payment messages");
    }
  };

  const handleOpenModal = async () => {
    setIsOpen(true);
    setLoading(true);
    await fetchMessages(false); // Initial fetch
    setLoading(false);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleTerminate = async (smsId) => {
    const payload = {
      email: "godfrey@gmail.com",
      password: "123123456",
    };

    try {
      await axios.put(
        `${BASE_URL}/api/sms/${smsId}/mark-processed`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );

      toast.success("Marked as processed!");

      setPaymentData((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item.id === smsId ? { ...item, isProcessed: true } : item
        ),
      }));
    } catch (error) {
      console.error("Error terminating message:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to mark message as processed",
      });
    }
  };

  // Polling every 30 seconds when modal is open
  useEffect(() => {
    let intervalId;
    if (isOpen) {
      intervalId = setInterval(() => {
        fetchMessages(true); // Fetch with toast notification enabled
      }, 30000); // 30 seconds
    }
    return () => clearInterval(intervalId);
  }, [isOpen]);

  const filteredData = paymentData?.data?.filter((item) =>
    item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <li
        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600"
        onClick={handleOpenModal}
      >
        <BadgeCent className="w-5 h-5" />
        <div>Show Payment</div>
      </li>
      <ToastContainer />
      {/* <div className="p-4">
        <button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg hover:opacity-90 shadow-md"
        >
          Show Payment
        </button>
      </div> */}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-semibold text-gray-800 mb-4"
                  >
                    💰 Payment Received Messages
                  </Dialog.Title>

                  <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by reference..."
                      className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    {loading ? (
                      <p className="text-gray-600">Loading...</p>
                    ) : filteredData?.length > 0 ? (
                      <div className="overflow-hidden border rounded-lg">
                        <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left">Reference</th>
                              <th className="px-4 py-3 text-left">Amount</th>
                              <th className="px-4 py-3 text-left">Message</th>
                              <th className="px-4 py-3 text-center">
                                Processed
                              </th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((sms) => (
                              <tr key={sms.id}>
                                <td className="px-4 py-2 font-medium text-gray-800">
                                  {sms.reference}
                                </td>
                                <td className="px-4 py-2 text-right text-green-600 font-semibold">
                                  GHS {sms.amount}.00
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                  <div className="relative group">
                                    {truncateMessage(sms.message)}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {sms.isProcessed ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => handleTerminate(sms.id)}
                                    className={`px-4 py-1 rounded-full text-sm font-medium shadow transition ${
                                      sms.isProcessed
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                    disabled={sms.isProcessed}
                                  >
                                    Terminate
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                         </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No payment messages found.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 transition shadow"
                      onClick={closeModal}
                    >
                      Close
                    </button>
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

export default PaymentModal;
