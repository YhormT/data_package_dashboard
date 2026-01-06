// Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  History,
  User,
} from "lucide-react";
import TransactionsModal from "./TransactionsModal";
import UploadExcel from "./UploadExcel";
import PasteOrders from "./PasteOrders";
import Logo from "../assets/logo-icon.png";
import bgImage from "../assets/sidefloor.jpg";
import { Dialog } from "@headlessui/react";
import AuditLog from "./AuditLog";

const Sidebar = ({
  isOpen,
  setIsOpen,
  selectedCategory,
  handleCategorySelect,
  logoutUser,
  setDailySalesOpen,
  onUploadSuccess
}) => {
  const navigate = useNavigate();
  const [showAuditLog, setShowAuditLog] = React.useState(false);
  return (
    <aside
      className={`bg-white w-64 p-5 fixed h-full transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } md:translate-x-0 shadow-lg flex flex-col z-50`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "contain",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <img src={Logo} height={100} width={100} alt="Logo" />
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            X
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto">
          <ul className="space-y-4">
            
            {/* Home */}
            <li
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                window.location.pathname === "/dashboard/home"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                handleCategorySelect(null);
                setIsOpen(false);
              }}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </li>

            {/* MTN */}
            <li
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                selectedCategory === "MTN"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                handleCategorySelect("MTN");
                setIsOpen(false);
              }}
            >
              <img
                src="https://images.seeklogo.com/logo-png/9/1/mtn-logo-png_seeklogo-95716.png"
                className="w-5 h-5"
                alt="MTN"
              />
              <span>MTN</span>
            </li>

            {/* TELECEL */}
            <li
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                selectedCategory === "TELECEL"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                handleCategorySelect("TELECEL");
                setIsOpen(false);
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl4R7lA1tlSlrBzf9OrDXIswYytfI7TfvC0w&s"
                className="w-5 h-5"
                alt="TELECEL"
              />
              <span>TELECEL</span>
            </li>

            {/* AIRTEL TIGO */}
            <li
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
                selectedCategory === "AIRTEL TIGO"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                handleCategorySelect("AIRTEL TIGO");
                setIsOpen(false);
              }}
            >
              <img
                src="https://play-lh.googleusercontent.com/yZFOhTvnlb2Ply82l8bXusA3OAhYopla9750NcqsjqcUNAd4acuohCTAlqHR9_bKrqE"
                className="w-5 h-5"
                alt="AIRTEL TIGO"
              />
              <span>AIRTEL TIGO</span>
            </li>

            <hr className="my-10" />
            <TransactionsModal />
            <hr className="my-10" />
            <div onClick={() => setIsOpen(false)}>
              <UploadExcel onUploadSuccess={onUploadSuccess} />
            </div>

            <hr className="my-5" />

            <div onClick={() => setIsOpen(false)}>
              <PasteOrders onUploadSuccess={onUploadSuccess} />
            </div>

            {/* Profile */}
            <li
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </li>

            {/* Logout */}
            <li
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-700 cursor-pointer text-black-500"
              onClick={logoutUser}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;


