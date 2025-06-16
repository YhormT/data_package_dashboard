// Sidebar.js
import React from "react";
import {
  Home,
  LogOut,
  History,
} from "lucide-react";
import TransactionsModal from "./TransactionsModal";
import UploadExcel from "./UploadExcel";
import Logo from "../assets/logo-icon.png";
import bgImage from "../assets/sidefloor.jpg";

const Sidebar = ({
  isOpen,
  setIsOpen,
  selectedCategory,
  handleCategorySelect,
  logoutUser,
  setDailySalesOpen
}) => {
  return (
    <aside
      className={`bg-white w-64 p-5 fixed h-full transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } md:translate-x-0 shadow-lg flex flex-col justify-between`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "contain",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <img src={Logo} height={150} width={150} />
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            X
          </button>
        </div>

        <hr />

        <nav>
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
              />
              <span>AIRTEL TIGO</span>
            </li>

            <hr className="my-10" />
            <TransactionsModal />
            <hr className="my-10" />
            <div onClick={() => setIsOpen(false)}>
              <UploadExcel />
            </div>

            {/* Daily Sales */}
            {/* <li
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer text-green-600"
              onClick={() => {
                setDailySalesOpen(true);
                setIsOpen(false);
              }}
            >
              <History className="w-5 h-5" />
              <span>Daily Sales</span>
            </li> */}

            {/* Logout */}
            <li
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer mt-6 text-red-500"
              onClick={logoutUser}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mb-[100px] p-3 bg-gray-100 rounded-lg text-center">
        <p className="text-xs text-gray-500">Sponsored Ad</p>
        <video
          className="mt-2 rounded-lg w-full hover:opacity-80 transition-opacity duration-300"
          controls
          autoPlay
          loop
          muted
        >
          <source
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </aside>
  );
};

export default Sidebar;


