import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";
import { Dialog } from "@headlessui/react";
import { MessageCircle, X, Search, Calendar, Filter, Package, Phone, Clock, CreditCard, TrendingUp, ChevronDown } from "lucide-react";

const ITEMS_PER_PAGE = 20;

const StatusBadge = memo(({ status }) => {
  const config = {
    Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
    Processing: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", border: "border-sky-200" },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
    Cancelled: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
  };
  const c = config[status] || config.Cancelled;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
});

const StatCard = memo(({ icon: Icon, label, value, suffix }) => (
  <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/15 transition-colors">
    <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <div className="text-xl sm:text-2xl font-semibold text-white tabular-nums">
      {value}{suffix && <span className="text-sm ml-1 font-normal text-white/70">{suffix}</span>}
    </div>
  </div>
));

const OrderCard = memo(({ item, order }) => {
  const whatsappUrl = useMemo(() => {
    if (item.status !== "Completed") return null;
    return `https://wa.me/233540277583?text=${encodeURIComponent(
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
    )}`;
  }, [item, order]);

  const formattedDate = useMemo(() => {
    const d = new Date(order.createdAt);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [order.createdAt]);

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 will-change-transform">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium tracking-wide mb-1.5">
              <span>#{order.id || "N/A"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Item #{item.id || "N/A"}</span>
            </div>
            <StatusBadge status={item.status} />
          </div>
          
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
              title="Report issue on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </a>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          <InfoCell icon={Phone} iconBg="bg-blue-50" iconColor="text-blue-600" label="Phone" value={item.mobileNumber || "N/A"} />
          <InfoCell icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Date & Time" value={formattedDate} />
          <InfoCell icon={Package} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Product" value={item.product?.name || "Unknown"} />
          <InfoCell icon={CreditCard} iconBg="bg-teal-50" iconColor="text-teal-600" label="Bundle" value={item.product?.description || "Unknown"} />
        </div>
      </div>
    </div>
  );
});

const InfoCell = memo(({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-medium text-slate-700 truncate">{value}</div>
    </div>
  </div>
));

const FilterInput = memo(({ icon: Icon, placeholder, value, onChange, type = "text", children }) => (
  <div className="relative">
    <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    {children || (
      <input
        type={type}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none"
        value={value}
        onChange={onChange}
      />
    )}
  </div>
));

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const OrderHistory = ({ isHistoryOpen, setIsHistoryOpen, orderHistory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemIdFilter, setItemIdFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef(null);

  const debouncedSearch = useDebounce(searchTerm, 150);
  const debouncedItemId = useDebounce(itemIdFilter, 150);

  useEffect(() => {
    if (isHistoryOpen) {
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [isHistoryOpen, debouncedSearch, debouncedItemId, statusFilter, selectedDate]);

  const { filteredItems, stats } = useMemo(() => {
    const ordersForSelectedDate = selectedDate
      ? orderHistory.filter(order => 
          new Date(order.createdAt).toDateString() === selectedDate.toDateString()
        )
      : orderHistory;

    const items = [];
    ordersForSelectedDate.forEach(order => {
      order.items.forEach(item => {
        const matchesSearch = !debouncedSearch || item.mobileNumber?.includes(debouncedSearch);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        const matchesItemId = !debouncedItemId || String(item.id).includes(debouncedItemId);
        
        if (matchesSearch && matchesStatus && matchesItemId) {
          items.push({ item, order });
        }
      });
    });

    let totalAmount = 0;
    let totalGB = 0;
    
    items.forEach(({ item }) => {
      const price = item.product?.price || 0;
      const amount = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.-]/g, ""));
      if (!isNaN(amount)) totalAmount += amount;
      
      if (item.status === 'Completed') {
        const description = item.product?.description || '';
        const gbMatch = description.match(/(\d+(?:\.\d+)?)\s*GB/i);
        if (gbMatch) totalGB += parseFloat(gbMatch[1]);
      }
    });

    return {
      filteredItems: items,
      stats: { count: items.length, amount: totalAmount, gb: totalGB }
    };
  }, [orderHistory, selectedDate, debouncedSearch, statusFilter, debouncedItemId]);

  const visibleItems = useMemo(() => 
    filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 200 && visibleCount < filteredItems.length) {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
    }
  }, [visibleCount, filteredItems.length]);

  const handleDateChange = useCallback((e) => {
    if (e.target.value) {
      const date = new Date(e.target.value);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      setSelectedDate(new Date(date.getTime() + userTimezoneOffset));
    } else {
      setSelectedDate(null);
    }
  }, []);

  const handleClose = useCallback(() => setIsHistoryOpen(false), [setIsHistoryOpen]);

  return (
    <Dialog open={isHistoryOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
          
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                Order History
              </Dialog.Title>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard icon={TrendingUp} label="Orders" value={stats.count} />
              <StatCard icon={Package} label="Data" value={stats.gb.toFixed(1)} suffix="GB" />
              <StatCard icon={CreditCard} label="Amount" value={`₵${stats.amount.toFixed(0)}`} />
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FilterInput
                icon={Search}
                placeholder="Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterInput
                icon={Search}
                placeholder="Item ID..."
                value={itemIdFilter}
                onChange={(e) => setItemIdFilter(e.target.value)}
              />
              <FilterInput icon={Calendar}>
                <input
                  type="date"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ""}
                  onChange={handleDateChange}
                />
              </FilterInput>
              <FilterInput icon={Filter}>
                <select
                  className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </FilterInput>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 bg-slate-50/50"
          >
            {visibleItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleItems.map(({ item, order }) => (
                  <OrderCard key={`${order.id}-${item.id}`} item={item} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No orders found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
            
            {visibleCount < filteredItems.length && (
              <div className="flex justify-center py-4 mt-2">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length))}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Load more ({filteredItems.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OrderHistory;
