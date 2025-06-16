import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Filter, Upload, FileStack } from "lucide-react";
import axios from "axios";
import _ from "lodash";
import BASE_URL from "../endpoints/endpoints";
import DailySalesCard from "./DailySalesCard";

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

  // Get user ID from local storage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format amount with sign and color
  const formatAmount = (amount) => {
    return amount >= 0 ? `+${amount}` : amount;
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  // Fetch transactions data using axios
  const fetchTransactions = () => {
    setLoading(true);
    setError(null);

    // Use the user ID from localStorage or fallback to a default
    const userIdToUse = userId;

    // Using axios as shown in your example

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${BASE_URL}/api/users/${userIdToUse}/transactions`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        if (response.data.success) {
          setTransactions(response.data.data);
          setFilteredTransactions(response.data.data);
        } else {
          setError("Failed to load transactions");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError("Error fetching transactions: " + error.message);
        setTransactions([]);
        setFilteredTransactions([]);
        setLoading(false);
      });
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

  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Open modal and fetch data
  const openModal = () => {
    setIsOpen(true);
    fetchTransactions();
  };

  // Get unique transaction types for filter dropdown
  const transactionTypes = _.uniq(_.map(transactions, "type"));

  const [dailySalesTotal, setDailySalesTotal] = useState(0);

  useEffect(() => {
  const today = new Date();
  const filtered = transactions.filter((tx) => {
    const createdAt = new Date(tx.createdAt);
    return (
      tx.type === "ORDER" &&
      createdAt.toDateString() === today.toDateString()
    );
  });

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  setDailySalesTotal(total);
}, [transactions]);


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
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          aria-hidden="true"
        />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* <Dialog.Panel className="bg-white rounded-lg w-11/12 max-w-6xl max-h-screen overflow-hidden"> */}
         <Dialog.Panel className="bg-white rounded-lg w-11/12 max-w-6xl h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-xl font-semibold">
                Transaction History
              </Dialog.Title>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2 w-40"
                  >
                    <option value="">All Types</option>
                    {transactionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    name="amountMin"
                    value={filters.amountMin}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2 w-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    name="amountMax"
                    value={filters.amountMax}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2 w-24"
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
                >
                  <Filter size={16} /> Reset Filters
                </button>
              </div>
            </div>

            <DailySalesCard
              amount={dailySalesTotal}
              onClick={() => setIsOpen(true)} // or open sales modal
            />

            {/* Table Container */}
            {/* <div className="p-4 overflow-auto max-h-96"> */}
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
                      {/* <th className="border px-4 py-2 text-left">Name</th> */}
                      <th className="border px-4 py-2 text-left">Type</th>
                      <th className="border px-4 py-2 text-left">
                        Description
                      </th>
                      <th className="border px-4 py-2 text-right">Amount</th>
                      <th className="border px-4 py-2 text-right">Balance</th>
                      <th className="border px-4 py-2 text-left">
                        Date & Time
                      </th>
                      {/* <th className="border px-4 py-2 text-left">Reference</th> */}
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
                        {/* <td className="border px-4 py-2">{transaction.user?.name}</td> */}
                        <td className="border px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium
                            ${
                              transaction.type === "TOPUP_APPROVED"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              transaction.type === "TOPUP_REJECTED"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              transaction.type === "ORDER"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }
                            ${
                              transaction.type === "LOAN_DEDUCTION"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              transaction.type === "CART_ADD"
                                ? "bg-orange-100 text-orange-800"
                                : ""
                            }
                            ${
                              transaction.type === "CART_REMOVE"
                                ? "bg-purple-100 text-purple-800"
                                : ""
                            }
                            ${
                              transaction.type === "LOAN_STATUS"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                            ${
                              transaction.type === "TOPUP_REQUEST"
                                ? "bg-gray-100 text-gray-800"
                                : ""
                            }
                            `}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td
                          // className="border px-4 py-2 "
                          className={`border px-4 py-2 text-left ${
                            transaction.type === "TOPUP_REJECTED" ||
                            (transaction.description &&
                              transaction.description.includes(
                                "Top-up rejected"
                              ))
                              ? "text-red-600"
                              : transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          // className={`border px-4 py-2 text-left ${
                          //   transaction.amount >= 0
                          //     ? "text-green-600"
                          //     : "text-red-600"
                          // }`}
                        >
                          {transaction.description}
                        </td>
                        <td
                          // className={`border px-4 py-2 text-left whitespace-nowrap ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          className={`border px-4 py-2 text-left whitespace-nowrap ${
                            transaction.type === "TOPUP_REJECTED" ||
                            (transaction.description &&
                              transaction.description.includes(
                                "Top-up rejected"
                              ))
                              ? "text-red-600"
                              : transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          GH₵{" "}
                          {formatAmount(
                            transaction.amount.toLocaleString("en-GH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          )}
                        </td>
                        <td
                          // className={`border px-4 py-2 text-left whitespace-nowrap ${transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          className={`border px-4 py-2 text-left whitespace-nowrap ${
                            transaction.type === "TOPUP_REJECTED" ||
                            (transaction.description &&
                              transaction.description.includes(
                                "Top-up rejected"
                              ))
                              ? "text-red-600"
                              : transaction.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          GH₵{" "}
                          {transaction.balance.toLocaleString("en-GH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          // className="border px-4 py-2"
                          className={`border px-4 py-2 whitespace-nowrap ${
                            transaction.type === "TOPUP_REJECTED" ||
                            (transaction.description &&
                              transaction.description.includes(
                                "Top-up rejected"
                              ))
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {formatDate(transaction.createdAt)}
                        </td>
                        {/* <td className="border px-4 py-2">{transaction.reference}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
