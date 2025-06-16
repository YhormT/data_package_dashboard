import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { DownloadIcon, Upload } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../endpoints/endpoints";
import template from '../assets/template/users.xlsx'

const UploadExcel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose an Excel file to upload.",
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "User ID Not Found",
        text: "Please log in before uploading.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/upload-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Upload Successful",
        text: "Your file has been uploaded successfully!",
      });

      setIsOpen(false); // Close the dialog after success
      setSelectedFile(null); // Reset file input
      console.log(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Something went wrong. Please try again.",
      });
      console.error("Upload Error:", error);
    }
  };

  return (
    <>
      {/* Upload Button */}
      <li
        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="w-5 h-5" />
        <span>Upload Excel</span>
      </li>

      {/* Dialog */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md transform transition-all">
            {/* Title */}
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Upload Excel File
            </Dialog.Title>

            {/* Description */}
            <Dialog.Description className="text-sm text-gray-500 mt-2">
              Select an Excel file (.xlsx, .xls) to upload.
            </Dialog.Description>

            {/* Template Download Button */}
            <div className="mt-4">
              <a
                href={template} // Ensure this path matches where the file is stored
                download="users.xlsx"
                className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download Template
              </a>
            </div>

            {/* File Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose File
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
              />
            </div>

            {/* File Name Display */}
            {selectedFile && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                Selected: {selectedFile.name}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
              >
                Upload
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default UploadExcel;
