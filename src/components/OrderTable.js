import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FileText,
  Bell,
  Check,
  SpellCheck,
  Clock,
  RotateCcw,
  CheckSquare,
  ChevronDown,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Loader,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import BASE_URL from "../endpoints/endpoints";

// Helper Component for Stat Cards
const StatCard = ({ icon, title, value, color, loading }) => (
  <div className={`bg-${color}-100 p-3 rounded-lg flex items-center space-x-3`}>
    <div className={`bg-${color}-200 p-2 rounded-full`}>{icon}</div>
    <div>
      <p className={`text-sm text-${color}-700`}>{title}</p>
      <p className={`text-lg font-bold text-${color}-800`}>
        {loading ? "..." : value}
      </p>
    </div>
  </div>
);

// Refactored and restyled component
const OrderTable = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [showNewRequestsOnly, setShowNewRequestsOnly] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const audioRef = useRef(null);

  // Filters State
  const [showFilters, setShowFilters] = useState(true);
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStatusMain, setSelectedStatusMain] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Modal State
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const prevItemsCountRef = useRef(0);
  const intervalRef = useRef(null);

  // --- DATA FETCHING AND SIDE EFFECTS ---

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    audioRef.current = new Audio("/notification-sound.mp3");

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchOrderData, refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/order/admin/allorder`);
      const currentTime = new Date();

      if (Array.isArray(response.data)) {
        const itemsList = response.data.flatMap((order) =>
          Array.isArray(order.items)
            ? order.items.map((item) => ({
                ...item,
                orderId: order.id,
                createdAt: order.createdAt,
                user: order.user,
                order: { ...order, items: [item] },
                isNew:
                  new Date(order.createdAt) >
                  new Date(currentTime - 5 * 60 * 1000),
              }))
            : []
        );

        const newCount = itemsList.length;
        if (prevItemsCountRef.current > 0 && newCount > prevItemsCountRef.current) {
          const newItemsCount = newCount - prevItemsCountRef.current;
          setHasNewRequests(true);
          setNewRequestsCount(newItemsCount);
          if (notificationsEnabled) {
            if (Notification.permission === "granted") {
              new Notification("New Requests", {
                body: `${newItemsCount} new requests have arrived.`,
                icon: "/favicon.ico",
              });
            }
            audioRef.current?.play().catch(console.error);
          }
        }

        prevItemsCountRef.current = newCount;
        setAllItems(itemsList);
        setLastFetchTime(currentTime);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      Swal.fire({ icon: "error", title: "Connection Error", text: "Failed to fetch order data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  // --- MEMOIZED DATA ---

  const filteredOrders = useMemo(() => {
    let filtered = allItems.filter((item) => {
      if (!item.createdAt) return false;
      const orderDateTime = new Date(item.createdAt);
      const orderDate = orderDateTime.toISOString().split("T")[0];

      if (showNewRequestsOnly && !item.isNew) return false;
      if (orderIdFilter && !String(item.orderId).includes(orderIdFilter)) return false;
      if (selectedDate && orderDate !== selectedDate) return false;
      if (selectedProduct && item.product?.name !== selectedProduct) return false;
      if (selectedStatusMain && item.order?.items?.[0]?.status !== selectedStatusMain) return false;

      if (startTime && endTime && selectedDate) {
        const selectedStartTime = new Date(`${selectedDate}T${startTime}`);
        const selectedEndTime = new Date(`${selectedDate}T${endTime}`);
        if (orderDateTime < selectedStartTime || orderDateTime > selectedEndTime) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [
    allItems,
    selectedDate,
    selectedProduct,
    startTime,
    endTime,
    selectedStatusMain,
    showNewRequestsOnly,
    sortOrder,
    orderIdFilter,
  ]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    orderIdFilter,
    selectedProduct,
    selectedStatusMain,
    selectedDate,
    startTime,
    endTime,
    sortOrder,
    showNewRequestsOnly,
  ]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const stats = useMemo(() => ({
    pending: allItems.filter(item => item.order?.items?.[0]?.status === "Pending").length,
    completed: allItems.filter(item => item.order?.items?.[0]?.status === "Completed").length,
    processing: allItems.filter(item => item.order?.items?.[0]?.status === "Processing").length,
  }), [allItems]);

  // --- EVENT HANDLERS ---

  const handleUpdateStatus = async (orderId, status) => {
    Swal.fire({
      title: "Processing...",
      text: `Updating order to ${status}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await axios.put(`${BASE_URL}/order/orders/${orderId}/status`, { status });
      setAllItems((prev) =>
        prev.map((item) =>
          item.order?.id === orderId
            ? {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((oi) => ({ ...oi, status })),
                },
              }
            : item
        )
      );
      Swal.fire({ icon: "success", title: "Status Updated", timer: 2000 });
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({ icon: "error", title: "Update Failed" });
    }
  };

  const handleBatchCompleteProcessing = async () => {
    const processingItems = allItems.filter(
      (item) => item.order?.items?.[0]?.status === "Processing"
    );

    if (processingItems.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Orders to Update",
        text: "There are no orders with 'Processing' status.",
      });
    }

    const orderIds = [
      ...new Set(processingItems.map((item) => item.order?.id)),
    ].filter(Boolean);

    const { isConfirmed } = await Swal.fire({
      title: "Confirm Batch Update",
      text: `Are you sure you want to mark ${orderIds.length} orders as 'Completed'?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, complete them!",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Processing...",
      text: `Updating ${orderIds.length} orders.`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const updatePromises = orderIds.map((orderId) =>
        axios.put(`${BASE_URL}/order/orders/${orderId}/status`, { status: "Completed" })
      );
      await Promise.all(updatePromises);

      setAllItems((prev) =>
        prev.map((item) =>
          orderIds.includes(item.order?.id)
            ? {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((oi) => ({ ...oi, status: "Completed" })),
                },
              }
            : item
        )
      );

      Swal.fire({ icon: "success", title: "Batch Update Complete!", timer: 2000 });
    } catch (error) {
      console.error("Error during batch update:", error);
      Swal.fire({ icon: "error", title: "Batch Update Failed" });
    }
  };

  const handleModalSubmit = async () => {
    if (!selectedOrderId || !selectedStatus) {
      return Swal.fire({ icon: "warning", title: "Missing Information", text: "Please select a status." });
    }
    await handleUpdateStatus(selectedOrderId, selectedStatus);
    setIsOpenStatus(false);
  };
  
  const handleDownloadExcel = () => {
    if (!filteredOrders.length) {
      return Swal.fire({ icon: "warning", title: "No Data", text: "No data to export!" });
    }
    const dataToExport = filteredOrders.map((item) => ({
      "Order ID": item.orderId || "N/A",
      "User Phone": item?.mobileNumber || "N/A",
      "Product": item.product?.name || "N/A",
      "Description": item.product?.description?.replace(/\D+$/, "") || "N/A",
      "Status": item.order?.items?.[0]?.status || "N/A",
      "Date": new Date(item.createdAt).toLocaleDateString(),
      "Time": new Date(item.createdAt).toLocaleTimeString(),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "Filtered_Orders.xlsx");
  };

  const handleRefresh = () => {
    fetchOrderData();
    setHasNewRequests(false);
    setNewRequestsCount(0);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // --- RENDER ---
  return (
    <>
      {/* Main Dashboard Trigger */}
      <div
        className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4 w-full md:w-auto flex-1 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative"
        onClick={() => {
          setOpen(true);
          setHasNewRequests(false);
          setNewRequestsCount(0);
        }}
      >
        <FileText className="w-10 h-10 text-indigo-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Total Requests</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "..." : allItems?.length}
          </p>
        </div>
        {hasNewRequests && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-pulse">
            {newRequestsCount} new
          </div>
        )}
      </div>

      {/* Main Dialog */}
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl h-[95vh] bg-gray-50 rounded-2xl shadow-2xl flex flex-col">
                {/* Header */}
                <header className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-800">Requests Dashboard</h2>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <StatCard icon={<Info className="w-5 h-5"/>} title="Pending" value={stats.pending} color="blue" loading={loading} />
                    <StatCard icon={<Loader className="w-5 h-5"/>} title="Processing" value={stats.processing} color="yellow" loading={loading} />
                    <StatCard icon={<CheckCircle className="w-5 h-5"/>} title="Completed" value={stats.completed} color="green" loading={loading} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Refresh Data">
                      <RotateCcw className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${notificationsEnabled ? 'text-indigo-500' : 'text-gray-400'}`} title="Toggle Notifications">
                      <Bell className="w-5 h-5" />
                    </button>
                    <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Close">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </header>

                {/* Filters & Actions */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                      <Filter className="w-4 h-4 mr-2" />
                      <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                      <ChevronDown className={`w-5 h-5 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                     <div className="flex items-center space-x-2">
                        <button onClick={handleDownloadExcel} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Download Excel</button>
                        <button onClick={handleBatchCompleteProcessing} className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center"><CheckSquare className="w-4 h-4 mr-1.5" />Complete All Processing</button>
                    </div>
                  </div>
                  
                  <Transition
                    show={showFilters}
                    enter="transition-all ease-out duration-300"
                    enterFrom="opacity-0 -translate-y-4"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition-all ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-4"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-3">
                      <input type="text" value={orderIdFilter} onChange={e => setOrderIdFilter(e.target.value)} placeholder="Order ID..." className="p-2 border rounded-lg text-sm"/>
                      <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="">All Products</option>
                        <option value="MTN">MTN</option>
                        <option value="MTN - PREMIUM">MTN - PREMIUM</option>
                        <option value="MTN - SUPER">MTN - SUPER</option>
                        <option value="MTN - NORMAL">MTN - NORMAL</option>
                        <option value="MTN - OTHER">MTN - OTHER</option>
                        <option value="TELECEL">TELECEL</option>
                        <option value="TELECEL - PREMIUM">TELECEL - PREMIUM</option>
                        <option value="TELECEL - SUPER">TELECEL - SUPER</option>
                        <option value="TELECEL - NORMAL">TELECEL - NORMAL</option>
                        <option value="TELECEL - OTHER">TELECEL - OTHER</option>
                        <option value="AIRTEL TIGO">AIRTEL TIGO</option>
                        <option value="AIRTEL TIGO - PREMIUM">AIRTEL TIGO - PREMIUM</option>
                        <option value="AIRTEL TIGO - SUPER">AIRTEL TIGO - SUPER</option>
                        <option value="AIRTEL TIGO - NORMAL">AIRTEL TIGO - NORMAL</option>
                        <option value="AIRTEL TIGO - OTHER">AIRTEL TIGO - OTHER</option>
                      </select>
                      <select value={selectedStatusMain} onChange={e => setSelectedStatusMain(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="">All Statuses</option>
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg text-sm"/>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-2 border rounded-lg text-sm"/>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="p-2 border rounded-lg text-sm"/>
                      <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </Transition>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                  ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                        <tr>
                          <th scope="col" className="px-4 py-3">Order ID</th>
                          <th scope="col" className="px-4 py-3">Item ID</th>
                          <th scope="col" className="px-4 py-3">User</th>
                          <th scope="col" className="px-4 py-3">Phone</th>
                          <th scope="col" className="px-4 py-3">Product</th>
                          <th scope="col" className="px-4 py-3">Description</th>
                          <th scope="col" className="px-4 py-3">Date/Time</th>
                          <th scope="col" className="px-4 py-3">Status</th>
                          <th scope="col" className="px-4 py-3">Price</th>
                          <th scope="col" className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item) => (
                          <tr key={item.id} className={`border-b hover:bg-gray-100 ${item.isNew ? 'bg-green-50' : 'bg-white'}`}>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.orderId || 'N/A'}</td>
                            <td className="px-4 py-3">{item.id || 'N/A'}</td>
                            <td className="px-4 py-3">{item.user?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{item.mobileNumber || 'N/A'}</td>
                            <td className="px-4 py-3">{item.product?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{item.product?.description || 'N/A'}</td>
                            <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3">
                               <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                 item.order?.items?.[0]?.status === "Completed" ? "bg-green-100 text-green-800" :
                                 item.order?.items?.[0]?.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                                 item.order?.items?.[0]?.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                 "bg-blue-100 text-blue-800"
                               }`}>{item.order?.items?.[0]?.status || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold">GH₵ {item.product?.price || 0}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => { setSelectedOrderId(item.order.id); setIsOpenStatus(true); }} className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30" disabled={item.order?.items?.[0]?.status === 'Cancelled'}><SpellCheck className="w-4 h-4"/></button>
                              <button onClick={() => handleUpdateStatus(item.order.id, 'Completed')} className="p-1.5 text-gray-500 hover:text-green-600 disabled:opacity-30" disabled={item.order?.items?.[0]?.status === 'Cancelled'}><Check className="w-4 h-4"/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {paginatedItems.length === 0 && !loading && <div className="text-center py-10 text-gray-500">No orders found.</div>}
                </div>

                {/* Footer / Pagination */}
                <footer className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Showing {paginatedItems.length} of {filteredOrders.length} results</span>
                    {totalPages > 1 && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => p - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                              if (totalPages <= 7) return true;
                              if (currentPage <= 4) return page <= 5 || page === totalPages;
                              if (currentPage >= totalPages - 3) return page >= totalPages - 4 || page === 1;
                              return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                          })
                          .map((page, index, array) => (
                            <>
                              {index > 0 && page - array[index - 1] > 1 && <span className="px-2 py-1 text-sm">...</span>}
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm font-medium border rounded-md ${
                                  currentPage === page
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </>
                          ))}
                        <button
                          onClick={() => setCurrentPage(p => p + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          &gt;
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          End
                        </button>
                      </div>
                    )}
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Status Update Modal */}
      <Transition show={isOpenStatus} as={Fragment}>
        <Dialog onClose={() => setIsOpenStatus(false)} className="relative z-50">
           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6">
                <Dialog.Title className="text-lg font-semibold text-gray-900">Update Order Status</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-600">Select a new status for order <strong>#{selectedOrderId}</strong>.</Dialog.Description>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full mt-4 p-2 border rounded-lg text-sm">
                  <option value="">Select status</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setIsOpenStatus(false)} className="px-4 py-2 bg-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300">Cancel</button>
                  <button onClick={handleModalSubmit} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Update Status</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default OrderTable;