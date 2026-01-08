import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, X, Home, BarChart, Settings, User, LogOut, ShoppingCart, Trash, History, MessageCircleWarning, } from "lucide-react";
import { Dialog } from "@headlessui/react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import bgImage from "../assets/sidefloor.jpg";
import bgImageMain from "../assets/sidebg.jpg";
import BASE_URL from "../endpoints/endpoints";
import OrderHistory from "../components/OrderHistory";
import Logo from "../assets/logo-icon.png";
import TopUp from "../components/TopUp";
import UploadExcel from "../components/UploadExcel";
import PasteOrders from "../components/PasteOrders";
import TransactionsModal from "../components/TransactionsModal";
import AgentNotifications from "../components/AgentNotifications";

const SuperAgent = () => {
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [loanBalance, setLoanBalance] = useState(null);

  const [topUp, setTopUp] = useState(false);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // For tracking user activity
  const [lastActivity, setLastActivity] = useState(Date.now());
  const inactivityTimeout = useRef(null);
  const INACTIVE_TIMEOUT = 2700000; // 45 minutes

  const logoutUser = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId && token) {
        const data = JSON.stringify({
          userId: parseInt(userId, 10),
        });

        const config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${BASE_URL}/api/auth/logout`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: data,
        };

        await axios.request(config);
      }
    } catch (error) {
      console.error("Error during server logout:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    }
  }, [navigate]);

  // Reset the timer whenever there's user activity
  const resetInactivityTimer = useCallback(() => {
    setLastActivity(Date.now());

    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }

    inactivityTimeout.current = setTimeout(() => {
      Swal.fire({
        title: "Inactivity Detected",
        text: "You will be logged out in 1 minute due to inactivity.",
        icon: "warning",
        timer: 60000,
        showConfirmButton: true,
        confirmButtonText: "Keep me logged in",
        showCancelButton: true,
        cancelButtonText: "Logout now",
      }).then((result) => {
        if (result.isConfirmed) {
          resetInactivityTimer();
        } else {
          logoutUser();
        }
      });
    }, INACTIVE_TIMEOUT);
  }, [logoutUser]);

  // Set up event listeners for user activity
  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    const role = localStorage.getItem("role");
        if (role !== "SUPER") {
      navigate("/login");
    }
  }, [navigate]);

  const [transactionInProgress, setTransactionInProgress] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    let interval;
    let isComponentMounted = true;

    const fetchLoanBalance = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/users/loan/${userId}`
        );
        if (isComponentMounted) {
          setLoanBalance(response.data);
        }
      } catch (err) {
        if (isComponentMounted) {
          setError(err.message);
        }
      }
    };

    if (userId) {
      fetchLoanBalance();
      // CRITICAL FIX: Reduce polling from 1 second to 15 seconds
      interval = setInterval(fetchLoanBalance, 15000);
    }

    return () => {
      isComponentMounted = false;
      if (interval) clearInterval(interval);
    };
    }, []);

  const fetchFreshBalance = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/loan/${userId}`);
      return Math.abs(parseFloat(response.data.loanBalance));
    } catch (error) {
      throw new Error("Failed to fetch current balance");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/products`);
        const newData = await response.json();

        // Only update if data has changed to avoid re-renders
        const hasChanged = JSON.stringify(products) !== JSON.stringify(newData);
        if (hasChanged) {
          setProducts(newData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts(); // Initial fetch
    const intervalId = setInterval(fetchProducts, 10000); // Poll every 10 sec

    return () => clearInterval(intervalId); // Cleanup
  }, [products]);

  const fetchCart = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID is missing from localStorage.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/cart/${userId}`);
      const data = await response.json();

      //console.log("Fetched Cart Data:", data);

      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  };

  //console.log("Cart:", cart);

  useEffect(() => {
    fetchCart();
  }, []);

  const [mobileNumbers, setMobileNumbers] = useState({});

  const [error, setError] = useState({});

  const restrictions = {
    MTN: [
      "020",
      "050",
      "027",
      "057",
      "123",
      "023",
      "04",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ],
    TELECEL: [
      "057",
      "055",
      "024",
      "123",
      "023",
      "04",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ],
    "AIRTEL TIGO": [
      "050",
      "055",
      "024",
      "023",
      "054",
      "123",
      "04",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ],
  };

  const handleMobileNumberChange = (id, value) => {
    if (/^\d{0,10}$/.test(value)) {
      const product = filteredProducts?.find((p) => p.id === id);

      // Normalize provider name by removing " - SUPER"
      const normalizedProductName = product?.name.replace(" - SUPER", "");

      // Get restricted prefixes
      const restrictedPatterns = restrictions[normalizedProductName] || [];

      //console.log("User Input:", value);
      console.log(
        "Restricted Prefixes for",
        normalizedProductName,
        ":",
        restrictedPatterns
      );

      // Check if the number starts with a restricted pattern
      const isRestricted = restrictedPatterns.some((pattern) =>
        value.startsWith(pattern)
      );

      if (isRestricted) {
        setError((prev) => ({
          ...prev,
          [id]: `${
            product.name
          } numbers cannot start with: ${restrictedPatterns.join(", ")}`,
        }));
        return; // Stop updating state
      }

      // Clear error and update state if valid
      setError((prev) => ({ ...prev, [id]: "" }));
      setMobileNumbers((prev) => ({ ...prev, [id]: value }));
    }
  };

  const clearCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Error", "User not found. Please log in again.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove all items from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${BASE_URL}/api/cart/${userId}/clear`);
        if (response.data.success) {
          setCart([]); // Clear the cart in the state
          Swal.fire("Cleared!", "Your cart has been emptied.", "success");
        } else {
          Swal.fire("Error", response.data.error || "Could not clear the cart.", "error");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        Swal.fire("Error", "An error occurred while clearing the cart.", "error");
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to remove this item from the cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/api/cart/remove/${cartItemId}`);
          setCart((prevCart) =>
            prevCart.filter((item) => item.id !== cartItemId)
          ); // Update UI

          Swal.fire("Deleted!", "The item has been removed.", "success");
        } catch (error) {
          console.error("Error removing item:", error);
          Swal.fire("Error!", "Failed to remove the item.", "error");
        }
      }
    });
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // State to manage input visibility
  const [showInput, setShowInput] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  // Function to filter products
  const filteredProducts = useMemo(() => selectedCategory
    ? products?.filter((product) => product.name === selectedCategory)
    : products, [products, selectedCategory]);

  const [filteredProducts1, setFilteredProducts1] = useState([]);

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts1([]); // Ensure it's always an array

      if (!navigator.onLine) {
        // Show SweetAlert if there's no internet
        Swal.fire({
          icon: "error",
          title: "No Internet Connection",
          text: "Please check your connection and try again.",
        });
      }

      return; // Exit early if products is not an array
    }

    // Filter only SUPERAGENT products safely
    if (products.length > 0) {
      const superAgentProducts = products.filter((product) =>
        product.name?.includes("SUPER")
      );
      setFilteredProducts1(superAgentProducts);
    } else {
      setFilteredProducts1([]);
    }
  }, [products]);

  useEffect(() => {
    const handleOnline = () => {
      Swal.fire({
        icon: "success",
        title: "Internet Restored",
        text: "The connection is back! Reloading the page...",
        timer: 3000, // Auto-close after 3 seconds
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.reload(); // Reload page after alert
      }, 3000);
    };

    window.addEventListener("online", handleOnline); // Listen for online event

    return () => {
      window.removeEventListener("online", handleOnline); // Cleanup event listener
    };
  }, []);

  const handleCategorySelect = (category) => {
    setLoading(true);

    setTimeout(() => {
      setSelectedCategory(category);

      if (category === null) {
        // Show all SUPER products when Home is clicked
        setFilteredProducts1(
          products?.filter((product) => product.name.includes("SUPER"))
        );
      } else {
        // Show SUPER products within the selected category
        setFilteredProducts1(
          products?.filter(
            (product) =>
              product.name.includes(category) &&
              product.name.includes("SUPER")
          )
        );
      }

      setLoading(false);
    }, 1000);
  };
  const [visibleInputs, setVisibleInputs] = useState({});

  // Toggle function
  const toggleInput = (id) => {
    setVisibleInputs((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle only the clicked card
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLoanBalance = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.get(`${BASE_URL}/api/users/loan/${userId}`);
      setLoanBalance(response.data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const submitCart = async () => {
    // CRITICAL FIX: Prevent multiple simultaneous transactions
    if (isSubmitting || transactionInProgress) {
      Swal.fire({
        icon: "info",
        title: "Transaction in Progress",
        text: "Please wait for the current transaction to complete.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setTransactionInProgress(true);

      const userId = parseInt(localStorage.getItem("userId"), 10);
      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "User ID is missing",
          text: "Please log in before submitting your cart.",
        });
        return;
      }

      // Calculate total cart amount
      const totalAmount = cart.reduce(
        (total, item) => total + item.product.price * (item.quantity || 1),
        0
      );

      // CRITICAL FIX: Fetch fresh balance immediately before transaction
      let freshBalance;
      try {
        freshBalance = await fetchFreshBalance(userId);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error Fetching Balance",
          text: "Unable to verify your current balance. Please try again.",
        });
        return;
      }

      // CRITICAL FIX: Validate with fresh balance
      if (isNaN(freshBalance) || totalAmount > freshBalance) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Funds",
          text: `Your current wallet balance is GHS ${freshBalance.toFixed(
            2
          )}, but your cart total is GHS ${totalAmount.toFixed(
            2
          )}. Please top up before proceeding.`,
          confirmButtonColor: "#d33",
        });
        // Update the displayed balance with fresh data
        setLoanBalance((prev) => ({ ...prev, loanBalance: freshBalance }));
        return;
      }

      // CRITICAL FIX: Include balance validation in API request
      const data = JSON.stringify({
        userId,
        expectedBalance: freshBalance,
        totalAmount: totalAmount,
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${BASE_URL}/order/submit`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth
        },
        data: data,
      };

      const response = await axios.request(config);

      // CRITICAL FIX: Handle server-side validation responses
      if (response.data.error === "INSUFFICIENT_BALANCE") {
        Swal.fire({
          icon: "error",
          title: "Transaction Failed",
          text: "Insufficient balance. Your balance may have changed.",
        });
        fetchLoanBalance(); // Refresh balance
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Cart Submitted!",
        text: "Your order has been placed successfully.",
        confirmButtonColor: "#28a745",
      }).then(() => {
        fetchCart();
        fetchLoanBalance();
        setIsCartOpen(false);
      });
    } catch (error) {
      console.error("Error submitting cart:", error);

      // CRITICAL FIX: Handle specific server errors
      if (
        error.response?.status === 400 &&
        error.response?.data?.error === "INSUFFICIENT_BALANCE"
      ) {
        Swal.fire({
          icon: "error",
          title: "Insufficient Balance",
          text: "Your balance is insufficient for this transaction.",
        });
        fetchLoanBalance();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Submit Cart",
          text: "There was an error processing your order. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setTransactionInProgress(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const userId = parseInt(localStorage.getItem("userId"), 10);
      if (!userId) return;

      const product = filteredProducts1?.find((p) => p.id === productId);
      if (!product) return;

      const mobileNumber = mobileNumbers[productId] || "";

      if (!mobileNumber.trim()) {
        setError((prev) => ({
          ...prev,
          [productId]:
            "Please enter a valid mobile number before adding to cart.",
        }));
        return;
      }

      // CRITICAL FIX: Fetch fresh balance before adding to cart
      let currentBalance;
      try {
        currentBalance = await fetchFreshBalance(userId);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to verify your balance. Please try again.",
        });
        return;
      }

      // CRITICAL FIX: Check if adding item would exceed balance
      const currentCartTotal = cart.reduce(
        (total, item) => total + item.product.price * (item.quantity || 1),
        0
      );
      const newTotal = currentCartTotal + product.price;

      if (newTotal > currentBalance) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Balance",
          text: `Adding this item would exceed your wallet balance. Current balance: GHS ${currentBalance.toFixed(
            2
          )}, Cart total would be: GHS ${newTotal.toFixed(2)}`,
        });
        // Update displayed balance
        setLoanBalance((prev) => ({ ...prev, loanBalance: currentBalance }));
        return;
      }

      const data = JSON.stringify({
        userId,
        productId,
        quantity: 1,
        mobileNumber,
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${BASE_URL}/api/cart/add`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth
        },
        data: data,
      };

      setLoading(true);
      await axios.request(config);
      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: `Product has been added to your cart.`,
        timer: 2000,
        showConfirmButton: false,
      });

      fetchCart();
      setMobileNumbers((prev) => ({ ...prev, [productId]: "" })); // Clear the input
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Something went wrong while adding the product to the cart.",
      });
      console.error("Error adding to cart:", error);
    }
  };

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    let intervalId;
    if (isHistoryOpen) {
      fetchOrderHistory();
      intervalId = setInterval(fetchOrderHistory, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHistoryOpen]);

  const fetchOrderHistory = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.get(`${BASE_URL}/order/admin/${userId}`);
      setOrderHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
    }
  };

  //console.log("orderHistory", orderHistory);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      
      {/* Modern Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 shadow-2xl flex flex-col z-50`}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-12 w-12 object-contain" />
              <div>
                <h2 className="text-white font-bold text-lg">Kelishub</h2>
                <span className="text-xs text-emerald-400">Super Agent</span>
              </div>
            </div>
            <button className="md:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 transition-colors" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Networks</p>
            <ul className="space-y-1">
              <li className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedCategory === null ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"}`} onClick={() => { handleCategorySelect(null); setIsOpen(false); }}>
                <Home className="w-5 h-5" /><span className="font-medium">All Products</span>
              </li>
              <li className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedCategory === "MTN" ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"}`} onClick={() => { handleCategorySelect("MTN"); setIsOpen(false); }}>
                <img src="https://images.seeklogo.com/logo-png/9/1/mtn-logo-png_seeklogo-95716.png" className="w-5 h-5 rounded" alt="MTN" /><span className="font-medium">MTN</span>
              </li>
              <li className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedCategory === "TELECEL" ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"}`} onClick={() => { handleCategorySelect("TELECEL"); setIsOpen(false); }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl4R7lA1tlSlrBzf9OrDXIswYytfI7TfvC0w&s" className="w-5 h-5 rounded" alt="Telecel" /><span className="font-medium">TELECEL</span>
              </li>
              <li className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedCategory === "AIRTEL TIGO" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"}`} onClick={() => { handleCategorySelect("AIRTEL TIGO"); setIsOpen(false); }}>
                <img src="https://play-lh.googleusercontent.com/yZFOhTvnlb2Ply82l8bXusA3OAhYopla9750NcqsjqcUNAd4acuohCTAlqHR9_bKrqE" className="w-5 h-5 rounded" alt="AirtelTigo" /><span className="font-medium">AIRTEL TIGO</span>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Tools</p>
            <div className="space-y-1">
              <div className="rounded-xl overflow-hidden"><TransactionsModal /></div>
              <div onClick={() => setIsOpen(false)} className="rounded-xl overflow-hidden"><UploadExcel onUploadSuccess={fetchCart} /></div>
              <div onClick={() => setIsOpen(false)} className="rounded-xl overflow-hidden"><PasteOrders onUploadSuccess={fetchCart} /></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Account</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200" onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                <User className="w-5 h-5" /><span className="font-medium">Profile</span>
              </li>
              <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200" onClick={logoutUser}>
                <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{loanBalance?.name || 'Agent'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 md:ml-72">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30">
          {/* Mobile Header */}
          <div className="md:hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <button className="p-2.5 rounded-xl bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all" onClick={() => setIsOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <AgentNotifications />
                <button className="relative p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{cart.length}</span>}
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 shadow-xl mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-white">GHS {parseFloat(Math.abs(loanBalance?.loanBalance || 0)).toFixed(2)}</p>
                  {loanBalance?.hasLoan && <p className="text-xs text-red-400 mt-1 animate-pulse">Loan: GHS {parseFloat(loanBalance?.adminLoanBalance || 0).toFixed(2)}</p>}
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all" onClick={() => setTopUp(true)}>Top Up</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all" onClick={() => setIsHistoryOpen(true)}>
                <History className="w-4 h-4" /><span className="text-sm">History</span>
              </button>
            </div>
          </div>

          {/* Tablet Header */}
          <div className="hidden md:flex lg:hidden p-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl px-4 py-2">
                <p className="text-xs text-slate-400">Balance</p>
                <p className="text-lg font-bold text-white">GHS {parseFloat(Math.abs(loanBalance?.loanBalance || 0)).toFixed(2)}</p>
              </div>
              {loanBalance?.hasLoan && <div className="text-sm text-red-500 font-medium animate-pulse">Loan: GHS {parseFloat(loanBalance?.adminLoanBalance || 0).toFixed(2)}</div>}
            </div>
            <div className="flex items-center gap-3">
              <AgentNotifications />
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all" onClick={() => setTopUp(true)}>Top Up</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all" onClick={() => setIsHistoryOpen(true)}><History className="w-4 h-4" /><span>History</span></button>
              <button className="relative p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex p-4 items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-slate-500">Welcome back,</p>
                <h1 className="text-xl font-bold text-slate-900">{loanBalance?.name || 'Agent'}</h1>
              </div>
              {loanBalance?.hasLoan && <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600 font-medium animate-pulse">Loan Balance: GHS {parseFloat(loanBalance?.adminLoanBalance || 0).toFixed(2)}</p></div>}
            </div>
            <div className="flex items-center gap-4">
              <AgentNotifications />
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-5 py-3 shadow-lg">
                <div>
                  <p className="text-xs text-slate-400">Wallet Balance</p>
                  <p className="text-xl font-bold text-white">GHS {parseFloat(Math.abs(loanBalance?.loanBalance || 0)).toFixed(2)}</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all" onClick={() => setTopUp(true)}>Top Up</button>
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all" onClick={() => setIsHistoryOpen(true)}><History className="w-5 h-5" /><span>Order History</span></button>
              <button className="relative p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">{cart.length}</span>}
              </button>
            </div>
          </div>
        </header>

        <OrderHistory
          isHistoryOpen={isHistoryOpen}
          setIsHistoryOpen={setIsHistoryOpen}
          orderHistory={orderHistory}
        />

        {userRole === "SUPER" ? (
          loading ? (
            <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">Loading products...</p>
              </div>
            </div>
          ) : (
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
              {/* Page Header */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {selectedCategory ? `${selectedCategory} Products` : "Super Agent Products"}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      {filteredProducts1?.length || 0} products available
                    </p>
                  </div>
                  
                  {/* Category Pills - Mobile */}
                  <div className="flex flex-wrap gap-2 md:hidden">
                    {["All", "MTN", "TELECEL", "AIRTEL TIGO"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat === "All" ? null : cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          (cat === "All" && selectedCategory === null) || selectedCategory === cat
                            ? cat === "MTN" ? "bg-yellow-500 text-white" : cat === "TELECEL" ? "bg-red-500 text-white" : cat === "AIRTEL TIGO" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {cat === "AIRTEL TIGO" ? "AirtelTigo" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts1
                  ?.filter((product) => userRole === "SUPER" ? product.name.includes("SUPER") : true)
                  .sort((a, b) => {
                    const extractGB = (desc) => {
                      const match = desc?.match(/(\d+(?:\.\d+)?)\s*GB/i);
                      return match ? parseFloat(match[1]) : Number.MAX_VALUE;
                    };
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return extractGB(a.description) - extractGB(b.description);
                  })
                  .map((product) => {
                    const isMTN = product.name.includes("MTN");
                    const isTelecel = product.name.includes("TELECEL");
                    const isAirtelTigo = product.name.includes("AIRTEL TIGO");
                    
                    const cardGradient = isMTN
                      ? "from-yellow-400 via-yellow-500 to-yellow-600"
                      : isTelecel
                      ? "from-red-500 via-red-600 to-red-700"
                      : isAirtelTigo
                      ? "from-blue-500 via-blue-600 to-blue-700"
                      : "from-emerald-500 via-emerald-600 to-emerald-700";

                    const buttonColor = isMTN
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : isTelecel
                      ? "bg-red-700 hover:bg-red-800"
                      : isAirtelTigo
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-emerald-700 hover:bg-emerald-800";

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${cardGradient}`}
                      >
                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium text-white mb-2">
                                {product.name.replace(" - SUPER", "")}
                              </span>
                              <h3 className="text-xl md:text-2xl font-bold text-white">{product.description}</h3>
                            </div>
                          </div>
                          
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-sm text-white/70">GHS</span>
                            <span className="text-2xl md:text-3xl font-bold text-white">{product.price}</span>
                          </div>

                          <div className="space-y-2">
                            <input
                              type="tel"
                              placeholder="Enter mobile number"
                              value={mobileNumbers[product.id] || ""}
                              onChange={(e) => handleMobileNumberChange(product.id, e.target.value)}
                              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 ${
                                error[product.id] ? "border-red-400" : "border-transparent"
                              } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all`}
                              maxLength={10}
                            />
                            {error[product.id] && (
                              <div className="flex items-center gap-2 px-2">
                                <MessageCircleWarning className="w-4 h-4 text-white" />
                                <p className="text-xs text-white font-medium">{error[product.id]}</p>
                              </div>
                            )}
                          </div>

                          <motion.button
                            onClick={() => addToCart(product.id)}
                            className={`mt-4 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                              loanBalance?.loanBalance === 0 || product.stock === 0
                                ? "bg-white/20 cursor-not-allowed"
                                : `${buttonColor} shadow-lg hover:shadow-xl`
                            }`}
                            whileHover={{ scale: loanBalance?.loanBalance > 0 && product.stock > 0 ? 1.02 : 1 }}
                            whileTap={{ scale: loanBalance?.loanBalance > 0 && product.stock > 0 ? 0.98 : 1 }}
                            disabled={loanBalance?.loanBalance === 0 || product.stock === 0}
                          >
                            {loanBalance?.loanBalance === 0 ? "Insufficient Balance" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </motion.button>
                        </div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Empty State */}
              {(!filteredProducts1 || filteredProducts1.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Products Found</h3>
                  <p className="text-slate-500">Try selecting a different category</p>
                </div>
              )}
            </main>
          )
        ) : (
          <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
              <p className="text-slate-500">Only Super Agent users can view these products.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Cart Modal */}
      <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl"><ShoppingCart className="w-6 h-6 text-white" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
                    <p className="text-sm text-emerald-100">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-white" /></button>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.product.name.includes("MTN") ? "bg-yellow-100" : item.product.name.includes("TELECEL") ? "bg-red-100" : item.product.name.includes("AIRTEL") ? "bg-blue-100" : "bg-emerald-100"}`}>
                        <span className="text-lg font-bold">{item.product.name.includes("MTN") ? "M" : item.product.name.includes("TELECEL") ? "T" : item.product.name.includes("AIRTEL") ? "A" : "S"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{item.product.description}</h3>
                        <p className="text-sm text-slate-500">{item.mobileNumber}</p>
                        <p className="text-sm font-medium text-slate-700">GHS {item.product.price}</p>
                      </div>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" onClick={() => removeFromCart(item.id)}><Trash className="w-5 h-5" /></button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><ShoppingCart className="w-10 h-10 text-slate-400" /></div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Your cart is empty</h3>
                  <p className="text-sm text-slate-500">Add some products to get started</p>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">GHS {cart.reduce((total, item) => total + item.product.price * (item.quantity || 1), 0).toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50" onClick={clearCart} disabled={cart.length === 0}>Clear All</button>
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || cart.length === 0} onClick={submitCart}>
                    {isSubmitting ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</span> : "Submit Order"}
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={topUp} onClose={() => setTopUp(false)} className="relative z-50">
        <TopUp setTopUp={setTopUp} />
      </Dialog>
    </div>
  );
};

export default SuperAgent;
