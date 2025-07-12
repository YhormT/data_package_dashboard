import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
// import { X, Filter, Upload, FileStack } from "lucide-react";
import { Filter, FileStack } from "lucide-react";
import axios from "axios";
import _ from "lodash";
import BASE_URL from "../endpoints/endpoints";
import DailySalesCard from "./DailySalesCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TransactionsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [dailySalesTotal, setDailySalesTotal] = useState(0);
  const [previousUserBalance, setPreviousUserBalance] = useState(0);

  // Top Up modal state
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [formData, setFormData] = useState({
    referenceId: "",
  });

  // Get user ID from local storage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format amount with sign and color
  const formatAmount = (amount) => {
    return amount >= 0 ? `+${amount}` : amount;
  };

  // Fetch transactions data using axios
  const fetchTransactions = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${BASE_URL}/api/users/${userId}/transactions`,
        headers: {},
      };

      const response = await axios.request(config);
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setTransactions(response.data.data || []);
        setFilteredTransactions(response.data.data || []);
      } else {
        setError("Failed to load transactions");
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Error fetching transactions: " + (error.response?.data?.message || error.message));
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to transactions
  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = _.filter(filtered, (t) => t.type === filters.type);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = _.filter(filtered, (t) => new Date(t.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = _.filter(filtered, (t) => new Date(t.createdAt) <= toDate);
    }

    if (filters.amountMin) {
      filtered = _.filter(
        filtered,
        (t) => t.amount >= parseFloat(filters.amountMin)
      );
    }

    if (filters.amountMax) {
      filtered = _.filter(
        filtered,
        (t) => t.amount <= parseFloat(filters.amountMax)
      );
    }

    setFilteredTransactions(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    });
    setFilteredTransactions(transactions);
  };

  // Handle Top Up verification
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.referenceId.trim()) {
      toast.error("Please enter a valid Transaction ID.");
      return;
    }

    setTopUpLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      const data = {
        userId: parseInt(userId, 10),
        referenceId: formData.referenceId,
      };

      const response = await axios.post(`${BASE_URL}/api/verify-sms`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        toast.success(
          `🎉 Top-Up Successful!\nAmount: GHS ${response.data.amount}\nNew Balance: GHS ${response.data.newBalance}`,
          {
            autoClose: 8000,
          }
        );
        setShowTopUp(false);
        setFormData({ referenceId: "" });
        fetchTransactions(); // Refresh transactions list
      } else {
        toast.error(
          response.data.message || "Transaction could not be verified."
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setTopUpLoading(false);
    }
  };

  // Open modal and fetch data
  const openModal = () => {
    setIsOpen(true);
    if (userId) {
      fetchTransactions();
    }
  };

  // Effect to fetch transactions when userId is available
  useEffect(() => {
    if (userId && isOpen) {
      fetchTransactions();
    }
  }, [userId, isOpen]);

  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  // Calculate daily sales total
  useEffect(() => {
    const today = new Date();
    const filtered = transactions.filter((tx) => {
      const createdAt = new Date(tx.createdAt);
      return (
        tx.type === "ORDER" &&
        createdAt.toDateString() === today.toDateString()
      );
    });

    const total = filtered.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    setDailySalesTotal(total);
  }, [transactions]);

  // Compute previous user balance as of the end of yesterday (23:59:59)
  useEffect(() => {
    if (transactions.length === 0) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const prevTxs = transactions
      .filter((tx) => {
        const createdAt = new Date(tx.createdAt);
        return createdAt <= yesterday;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (prevTxs.length > 0 && typeof prevTxs[0].balance === 'number') {
      setPreviousUserBalance(prevTxs[0].balance);
    } else {
      setPreviousUserBalance(0);
    }
  }, [transactions]);

  // Get unique transaction types for filter dropdown
  const transactionTypes = _.uniq(_.map(transactions, "type"));

  return (
    <div className="font-sans">
      {/* Button to open modal */}
      <div
        onClick={openModal}
        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300"
      >
        <FileStack className="w-5 h-5" />
        <span>Transaction History</span>
      </div>

      {/* Headless UI Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* Dialog backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg w-11/12 max-w-6xl h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-xl font-semibold">Transaction History</Dialog.Title>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTopUp(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Top Up
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Top Up Section */}
            {showTopUp && (
              <div className="p-4 border-b bg-blue-50">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="referenceId"
                      value={formData.referenceId}
                      onChange={handleChange}
                      placeholder="Enter your transaction ID"
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This is the reference number you received after making the payment
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowTopUp(false)}
                      className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      disabled={topUpLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={topUpLoading}
                    >
                      {topUpLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify & Complete"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4">
              {/* Filter Container */}
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-row gap-4 items-center">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2"
                    >
                      <option value="">All</option>
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">Date From</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">Date To</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">Min Amount</label>
                    <input
                      type="number"
                      name="amountMin"
                      value={filters.amountMin}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">Max Amount</label>
                    <input
                      type="number"
                      name="amountMax"
                      value={filters.amountMax}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
                >
                  <Filter size={16} /> Reset Filters
                </button>
              </div>

              <div className="flex flex-row gap-4 items-center mb-4">
                <DailySalesCard
                  amount={dailySalesTotal}
                  onClick={() => setIsOpen(true)}
                />
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start border border-gray-100 min-w-[220px]">
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Previous User Balance</h3>
                  <p className="text-2xl font-bold text-blue-500">
                    GH₵ {Math.abs(previousUserBalance).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Table Container */}
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                {loading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">{error}</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">No transactions found</div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Type</th>
                        <th className="border px-4 py-2 text-left">Description</th>
                        <th className="border px-4 py-2 text-right">Amount</th>
                        <th className="border px-4 py-2 text-right">Balance</th>
                        <th className="border px-4 py-2 text-left">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className={`
                            ${
                              transaction.type === "TOPUP_REJECTED" ||
                              (transaction.description &&
                                transaction.description.includes("Top-up rejected"))
                                ? "bg-red-50 hover:bg-red-100"
                                : "odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                            }
                          `}
                        >
                          <td className="border px-4 py-2">{transaction.id}</td>
                          <td className="border px-4 py-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium
                                ${transaction.type === "TOPUP_APPROVED" ? "bg-green-100 text-green-800" : ""}
                                ${transaction.type === "TOPUP_REJECTED" ? "bg-red-100 text-red-800" : ""}
                                ${transaction.type === "ORDER" ? "bg-blue-100 text-blue-800" : ""}
                                ${transaction.type === "LOAN_DEDUCTION" ? "bg-red-100 text-red-800" : ""}
                                ${transaction.type === "CART_ADD" ? "bg-orange-100 text-orange-800" : ""}
                                ${transaction.type === "CART_REMOVE" ? "bg-purple-100 text-purple-800" : ""}
                                ${transaction.type === "LOAN_STATUS" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${transaction.type === "TOPUP_REQUEST" ? "bg-gray-100 text-gray-800" : ""}
                              `}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td
                            className={`border px-4 py-2 text-left ${
                              transaction.type === "TOPUP_REJECTED" ||
                              (transaction.description &&
                                transaction.description.includes("Top-up rejected"))
                                ? "text-red-600"
                                : transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.description || 'N/A'}
                          </td>
                          <td
                            className={`border px-4 py-2 text-left whitespace-nowrap ${
                              transaction.type === "TOPUP_REJECTED" ||
                              (transaction.description &&
                                transaction.description.includes("Top-up rejected"))
                                ? "text-red-600"
                                : transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            GH₵{" "}
                            {formatAmount(
                              (transaction.amount || 0).toLocaleString("en-GH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            )}
                          </td>
                          <td
                            className={`border px-4 py-2 text-left whitespace-nowrap ${
                              transaction.type === "TOPUP_REJECTED" ||
                              (transaction.description &&
                                transaction.description.includes("Top-up rejected"))
                                ? "text-red-600"
                                : transaction.balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            GH₵{" "}
                            {(transaction.balance || 0).toLocaleString("en-GH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className={`border px-4 py-2 whitespace-nowrap ${
                              transaction.type === "TOPUP_REJECTED" ||
                              (transaction.description &&
                                transaction.description.includes("Top-up rejected"))
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}