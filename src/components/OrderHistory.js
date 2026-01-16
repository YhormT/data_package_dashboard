import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { MessageCircle, X, Search, Calendar, Filter, Package, Phone, Clock, CreditCard, TrendingUp } from "lucide-react";

const OrderHistory = ({ isHistoryOpen, setIsHistoryOpen, orderHistory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemIdFilter, setItemIdFilter] = useState(""); // ✅ New state
  const [selectedDate, setSelectedDate] = useState(null);

  // 1. Filter orders by the selected date first, if a date is selected
  const ordersForSelectedDate = selectedDate
    ? orderHistory.filter(order => 
        new Date(order.createdAt).toDateString() === selectedDate.toDateString()
      )
    : orderHistory; // If no date is selected, show all orders

  // 2. Apply other filters (search, status, etc.) to the date-filtered list
  const filteredOrders = ordersForSelectedDate.map((order) => {
      const filteredItems = order.items.filter(
        (item) =>
          (!searchTerm || item.mobileNumber.includes(searchTerm)) &&
          (!statusFilter || item.status === statusFilter) &&
          (!itemIdFilter || String(item.id).includes(itemIdFilter))
      );

      return filteredItems.length > 0
        ? { ...order, items: filteredItems }
        : null;
    })
    .filter(Boolean);

  // 3. Calculate stats from the final filtered list of items
  const finalFilteredItems = filteredOrders.flatMap(order => order.items);
  const dailyOrderCount = finalFilteredItems.length;

  const totalFilteredAmount = finalFilteredItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const amount = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.-]/g, ""));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);

  // Calculate total GB data for completed orders only
  const totalGBData = finalFilteredItems
    .filter(item => item.status === 'Completed')
    .reduce((total, item) => {
      const description = item.product?.description || '';
      const gbMatch = description.match(/(\d+(?:\.\d+)?)\s*GB/i);
      return total + (gbMatch ? parseFloat(gbMatch[1]) : 0);
    }, 0);

  return (
    <Dialog
      open={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-5xl max-h-[95vh] relative overflow-y-auto lg:overflow-hidden lg:flex lg:flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5 relative lg:flex-shrink-0">
            <Dialog.Title className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 pr-10">
              <Package className="w-6 h-6 sm:w-7 sm:h-7" />
              Order History
            </Dialog.Title>
            
            <button
              className="absolute top-4 sm:top-5 right-4 sm:right-6 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
              onClick={() => setIsHistoryOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-1">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Total Orders
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{dailyOrderCount}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-1">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  GB Data
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{totalGBData.toFixed(2)} <span className="text-base sm:text-lg">GB</span></div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-1">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Total Amount
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">₵{totalFilteredAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 lg:flex-shrink-0">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Filters</h3>
            </div>
            
            <div className="flex lg:grid lg:grid-cols-4 gap-2 sm:gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              <div className="relative flex-shrink-0 w-48 lg:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Phone"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative flex-shrink-0 w-40 lg:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Item ID"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={itemIdFilter}
                  onChange={(e) => setItemIdFilter(e.target.value)}
                />
              </div>

              <div className="relative flex-shrink-0 w-44 lg:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value);
                      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                      setSelectedDate(new Date(date.getTime() + userTimezoneOffset));
                    } else {
                      setSelectedDate(null);
                    }
                  }}
                />
              </div>

              <div className="relative flex-shrink-0 w-36 lg:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <select
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 lg:flex-1 lg:overflow-y-auto">
            {filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.flatMap((order) =>
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                              <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Order #{order.id || "N/A"}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Item #{item.id || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                                  item.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : item.status === "Processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                  item.status === "Pending"
                                    ? "bg-yellow-500"
                                    : item.status === "Processing"
                                    ? "bg-blue-500"
                                    : item.status === "Completed"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}></span>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          
                          {item.status === "Completed" && (
                            <a
                              href={`https://wa.me/233540277583?text=${encodeURIComponent(
                                `Hello, I have a complaint about my order:\n\n` +
                                `Order ID: ${order.id}\n` +
                                `Item ID: ${item.id}\n` +
                                `Phone: ${item.mobileNumber || "N/A"}\n` +
                                `Date: ${new Date(order.createdAt).toLocaleDateString()}\n` +
                                `Time: ${new Date(order.createdAt).toLocaleTimeString()}\n` +
                                `Item: ${item.product?.name || "Unknown"}\n` +
                                `Bundle: ${item.product?.description || "Unknown"}\n` +
                                `Status: ${item.status}\n\n` +
                                `Please assist me with this order.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                              title="Report issue on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </a>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Phone Number</div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.mobileNumber || "N/A"}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Date & Time</div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Product</div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.product?.name || "Unknown"}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Bundle Amount</div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.product?.description || "Unknown"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-base sm:text-lg font-medium">No orders found</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OrderHistory;
