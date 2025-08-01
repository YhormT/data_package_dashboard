import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  X,
  Home,
  BarChart,
  Settings,
  User,
  LogOut,
  ShoppingCart,
  Trash,
  History,
  MessageCircleWarning,
  Upload,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import bgImage from "../assets/sidefloor.jpg";
import bgImageMain from "../assets/sidebg.jpg";
import BASE_URL from "../endpoints/endpoints";
import TopUp from "../components/TopUp";
import OrderHistory from "../components/OrderHistory";
import Logo from "../assets/logo-icon.png";
import UploadExcel from "../components/UploadExcel";
import PasteOrders from "../components/PasteOrders";
import PasswordChange from "../components/PasswordChange";
import TransactionsModal from "../components/TransactionsModal";
import OtherProducts from "../components/OtherProducts";
import DailySalesModal from "../components/DailySalesCard";
import Sidebar from "../components/Sidebar";

const UserDashboard = ({ setUserRole, userRole }) => {
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
  const INACTIVE_TIMEOUT = 300000;

  const logoutUser = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId && token) {
        // Prepare the logout API call
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

        // Call the logout API
        await axios.request(config);
        console.log("User logged out successfully from server");
      }
    } catch (error) {
      console.error("Error during server logout:", error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Always perform client-side cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      setUserRole(null); // Reset state to show login screen
    }
  }, [setUserRole]);

  // Reset the timer whenever there's user activity
  const resetInactivityTimer = useCallback(() => {
    setLastActivity(Date.now());

    // Clear any existing timeout
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }

    // Set a new timeout
    inactivityTimeout.current = setTimeout(() => {
      // Show a warning before logging out
      Swal.fire({
        title: "Inactivity Detected",
        text: "You will be logged out in 1 minute due to inactivity.",
        icon: "warning",
        timer: 60000, // 1 minute warning
        showConfirmButton: true,
        confirmButtonText: "Keep me logged in",
        showCancelButton: true,
        cancelButtonText: "Logout now",
      }).then((result) => {
        if (result.isConfirmed) {
          // User clicked "Keep me logged in"
          resetInactivityTimer();
        } else {
          // User either clicked "Logout now" or the timer expired
          logoutUser();
        }
      });
    }, INACTIVE_TIMEOUT);
  }, [logoutUser]);

  // Set up event listeners for user activity
  useEffect(() => {
    // Events to monitor for activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Activity event handler
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for all activity events
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Initialize the timer when component mounts
    resetInactivityTimer();

    // Clean up event listeners when component unmounts
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
    if (role !== "USER") {
      navigate("/");
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
  }, [userRole]);

  const fetchFreshBalance = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/loan/${userId}`);
      return Math.abs(parseFloat(response.data.loanBalance));
    } catch (error) {
      throw new Error("Failed to fetch current balance");
    }
  };

  const fetchLoanBalance = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.get(`${BASE_URL}/api/users/loan/${userId}`);
      setLoanBalance(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  console.log("Loan Balance:", loanBalance);

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

      const response = await fetch(`${BASE_URL}/cart/${userId}`);
      const data = await response.json();

      console.log("Fetched Cart Data:", data);

      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  };

  // console.log("Cart:", cart);

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
      "123",
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
      "123",
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
      const restrictedPatterns = restrictions[product?.name] || [];

      // Check if the number starts with a restricted pattern
      if (restrictedPatterns.some((pattern) => value.startsWith(pattern))) {
        setError((prev) => ({
          ...prev,
          [id]: `${
            product.name
          } numbers cannot start with ${restrictedPatterns.join(", ")}`,
        }));
        return; // Prevent updating state
      }

      // Clear error and update state if valid
      setError((prev) => ({ ...prev, [id]: "" }));
      setMobileNumbers((prev) => ({ ...prev, [id]: value }));
    }
  };

  const addToCart = async (productId) => {
  try {
    const userId = parseInt(localStorage.getItem("userId"), 10);
    if (!userId) return;

    const product = filteredProducts1?.find(p => p.id === productId);
    if (!product) return;

    const mobileNumber = mobileNumbers[productId] || "";

    if (!mobileNumber.trim()) {
      setError((prev) => ({
        ...prev,
        [productId]: "Please enter a valid mobile number before adding to cart.",
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
      (total, item) => total + item.product.price * (item.quantity || 1), 0
    );
    const newTotal = currentCartTotal + product.price;

    if (newTotal > currentBalance) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Balance",
        text: `Adding this item would exceed your wallet balance. Current balance: GHS ${currentBalance.toFixed(2)}, Cart total would be: GHS ${newTotal.toFixed(2)}`,
      });
      // Update displayed balance
      setLoanBalance(prev => ({ ...prev, loanBalance: currentBalance }));
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
      url: `${BASE_URL}/cart/add/`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // Add auth
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
    setMobileNumbers(prev => ({ ...prev, [productId]: "" })); // Clear the input
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
          await axios.delete(`${BASE_URL}/cart/remove/${cartItemId}`);
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

// In the useEffect that loads initial products:
useEffect(() => {
  if (!Array.isArray(products)) {
    setFilteredProducts1([]);
    if (!navigator.onLine) {
      Swal.fire({
        icon: "error",
        title: "No Internet Connection",
        text: "Please check your connection and try again.",
      });
    }
    return;
  }

  // Only allow products with exact names
  const allowedNames = ["MTN", "TELECEL", "AIRTEL TIGO"];
  const filtered = products
    .filter((product) => allowedNames.includes(product.name))
    .sort((a, b) => {
      // First, group by network name
      const aNetwork = a.name?.toUpperCase() || '';
      const bNetwork = b.name?.toUpperCase() || '';
      
      if (aNetwork !== bNetwork) {
        return aNetwork.localeCompare(bNetwork);
      }
      
      // Within same network, sort by data size (ascending - smallest first)
      const aNum = parseFloat(a.description?.match(/\d+/)?.[0] || 0);
      const bNum = parseFloat(b.description?.match(/\d+/)?.[0] || 0);
      return aNum - bNum; // Ascending order (smallest first)
    });

  setFilteredProducts1(filtered);
}, [products]);

// In the handleCategorySelect function:
const handleCategorySelect = (category) => {
  setLoading(true);
  setSelectedCategory(category);

  setTimeout(() => {
    let filtered;
    const allowedNames = ["MTN", "TELECEL", "AIRTEL TIGO"];
    if (!category) {
      filtered = products?.filter(
        (product) => allowedNames.includes(product.name)
      );
    } else if (allowedNames.includes(category)) {
      filtered = products?.filter(
        (product) => product.name === category
      );
    } else {
      filtered = [];
    }

    // Sort the filtered products with network grouping and ascending order
    const sorted = filtered?.sort((a, b) => {
      // First, group by network name
      const aNetwork = a.name?.toUpperCase() || '';
      const bNetwork = b.name?.toUpperCase() || '';
      
      if (aNetwork !== bNetwork) {
        return aNetwork.localeCompare(bNetwork);
      }
      
      // Within same network, sort by data size (ascending - smallest first)
      const aNum = parseFloat(a.description?.match(/\d+/)?.[0] || 0);
      const bNum = parseFloat(b.description?.match(/\d+/)?.[0] || 0);
      return aNum - bNum; // Ascending order (smallest first)
    });

    setFilteredProducts1(sorted);
    setLoading(false);
  }, 1000);
};

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

  const [filteredProducts1, setFilteredProducts1] = useState(products);

  const [visibleInputs, setVisibleInputs] = useState({});

  // Toggle function
  const toggleInput = (id) => {
    setVisibleInputs((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle only the clicked card
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchOrderHistory();
    }
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

  console.log("orderHistory", orderHistory);

  const [dailySalesOpen, setDailySalesOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedCategory={selectedCategory}
        handleCategorySelect={handleCategorySelect}
        logoutUser={logoutUser}
        setDailySalesOpen={setDailySalesOpen}
        onUploadSuccess={fetchCart}
      />

      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <button className="md:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-md font-semibold uppercase whitespace-nowrap">
            <span className="">WELCOME</span> {loanBalance?.name}
          </h1>
          <div className="flex items-center space-x-4">
            {loanBalance?.hasLoan && (
              <div
                className="text-sm text-red-500 mt-2 animate-pulse hidden md:block"
                // style={{ zIndex: -9999999 }}
              >
                <span>Loan Balance: GHS {loanBalance?.adminLoanBalance}</span>
              </div>
            )}
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer md:flex items-center justify-center whitespace-nowrap"
              onClick={() => setTopUp(true)}
            >
              Top Up
            </div>

            <div className="bg-white p-2 rounded-lg shadow-md border border-gray-300 flex flex-col items-center hidden md:block cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-gray-700 uppercase">
                  Wallet :
                </h2>
                <div className="text-2xl font-bold text-blue-600 whitespace-nowrap">
                  GHS{" "}
                  {parseFloat(Math.abs(loanBalance?.loanBalance)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            <div
              className="relative cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                  {cart.length}
                </span>
              )}
            </div>

            {/* Order History Button */}
            <div
              onClick={() => setIsHistoryOpen(true)}
              className="md:hidden block"
            >
              <History className="w-5 h-5" />
            </div>
            <div
              className="bg-blue-500 text-white px-3 py-1 rounded-md items-center space-x-2 hidden md:block cursor-pointer"
              onClick={() => setIsHistoryOpen(true)}
            >
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Order History</span>
              </div>
            </div>

            <PasswordChange />
          </div>
        </header>

        <OrderHistory
          isHistoryOpen={isHistoryOpen}
          setIsHistoryOpen={setIsHistoryOpen}
          orderHistory={orderHistory}
        />
        {loading ? (
          <div
            className="flex justify-center items-center min-h-screen"
            style={{
              backgroundImage: `url(${bgImageMain})`, // Replace with your actual asset path
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          </div>
        ) : (
          <main
            className="p-6 bg-gray-100 min-h-screen"
            style={{
              backgroundImage: `url(${bgImageMain})`, // Replace with your actual asset path
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            <div className="md:hidden block text-center flex items-center justify-between">
              <div>
                <span>WALLET : </span>{" "}
                <span className="text-2xl text-center font-bold text-blue-600 mt-2 whitespace-nowrap">
                  GHS{" "}
                  {parseFloat(Math.abs(loanBalance?.loanBalance)).toFixed(2)}
                </span>
              </div>
              <div>
                {loanBalance?.hasLoan && (
                  <div className="text-sm font-extrabold text-red-500 mt-2 animate-pulse ">
                    Loan: GHS{" "}
                    {parseFloat(loanBalance?.adminLoanBalance).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-6 text-center text-gray-800">
              {selectedCategory
                ? `${selectedCategory} PRODUCTS`
                : "AVAILABLE PRODUCTS"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {filteredProducts1?.map((product) => (
                <div
                  key={product.id}
                  // className=" border p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300"
                  className={`border p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-cover bg-center 
                    ${
                      product.name === "MTN"
                        ? "bg-[url('https://img.freepik.com/premium-vector/trendy-abstract-background-design-with-yellow-background-used-texture-design-bright-poster_293525-2997.jpg')]"
                        : product.name === "TELECEL"
                        ? "bg-[url('https://cdn.vectorstock.com/i/500p/37/28/abstract-background-design-modern-red-and-gold-vector-49733728.jpg')]"
                        : product.name === "AIRTEL TIGO"
                        ? "bg-[url('https://t4.ftcdn.net/jpg/00/72/07/17/360_F_72071785_iWP4jgsalJFR1YdiumPMboDHHOZhA3Wi.jpg')]"
                        : "bg-white"
                    }
                  `}
                  // whileHover={{ scale: 1.05 }}
                  // whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-lg font-bold text-gray-100">
                    {product.name}
                  </h3>
                  <h3 className="text-lg font-bold text-gray-100">
                    {product.description}
                  </h3>
                  <p className="text-gray-100 mt-2 text-sm">
                    Price: GHS {product.price}
                  </p>

                  <>
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={mobileNumbers[product.id] || ""}
                      onChange={(e) =>
                        handleMobileNumberChange(product.id, e.target.value)
                      }
                      className={`mt-2 w-full p-2 border ${
                        error[product.id] ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {error[product.id] && (
                      <div className="flex items-center space-x-2">
                        <span className="text-white">
                          <MessageCircleWarning />{" "}
                        </span>
                        <p className="text-[10px] text-white font-semibold">
                          {error[product.id]}
                        </p>
                      </div>
                    )}
                  </>

                  <motion.button
                    onClick={() => addToCart(product.id)}
                    className={`mt-4 text-white px-6 py-2 rounded-lg w-full transition-colors duration-300 ${
                      loanBalance?.loanBalance === 0 || product.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    whileHover={{
                      scale:
                        loanBalance?.loanBalance > 0 && product.stock > 0
                          ? 1.1
                          : 1,
                    }}
                    whileTap={{
                      scale:
                        loanBalance?.loanBalance > 0 && product.stock > 0
                          ? 0.9
                          : 1,
                    }}
                    disabled={
                      loanBalance?.loanBalance === 0 || product.stock === 0
                    }
                  >
                    {loanBalance?.loanBalance === 0
                      ? "Insufficient Balance"
                      : product.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </motion.button>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>

      <Dialog
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30"
      >
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-2 sm:w-96 relative">
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cart Title */}
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>

          {/* Scrollable Cart Items */}
          <ul className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <li
                  key={index}
                  className="py-3 flex justify-between items-center"
                >
                  {/* Product Details */}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600">{item.mobileNumber}</p>
                    <p className="text-gray-600">{item.product.description}</p>
                    <span className="font-semibold">
                      GHS{item.product.price}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    className="text-red-500 hover:text-red-700 transition duration-300"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </li>
              ))
            ) : (
              <li className="py-3 text-gray-600">Your cart is empty.</li>
            )}
          </ul>

          {/* Total Amount */}
          {cart.length > 0 && (
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-lg font-bold">
                GHS
                {cart.reduce(
                  (total, item) => total + item.product.price * item.quantity,
                  0
                )}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              disabled={isSubmitting}
              onClick={submitCart}
            >
              {isSubmitting ? "Submitting..." : "Submit Cart"}
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={topUp}
        onClose={() => setTopUp(false)}
        className="relative z-50"
      >
        <TopUp setTopUp={setTopUp} />
      </Dialog>
    </div>
  );
};

export default UserDashboard;
