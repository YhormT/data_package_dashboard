import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { Edit, Trash, AlertCircle, RotateCcw, Filter, Store, Search } from "lucide-react";
import Swal from 'sweetalert2';
import BASE_URL from "../endpoints/endpoints";

const ProductDialog = ({ isDialogOpenProduct, setIsDialogOpenProduct }) => {
  // State management
  const [productId, setProductId] = useState(null);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch products. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load products when dialog opens
  useEffect(() => {
    if (isDialogOpenProduct) {
      fetchProducts();
    }
  }, [isDialogOpenProduct]);

  // Reset form
  const resetForm = () => {
    setProductId(null);
    setProductName("");
    setDescription("");
    setPrice("");
    setStock("");
  };

  // Populate form when editing a product
  const handleEditClick = (product) => {
    setProductId(product.id);
    setProductName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock);
  };

  // Handle add or update product
  const handleSaveProduct = async () => {
    // Validation
    if (!productName || !description || !price || stock === "") {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all fields',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: productName,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      };

      if (productId) {
        // Update existing product
        await axios.put(`${BASE_URL}/products/update/${productId}`, productData, {
          headers: { 'Content-Type': 'application/json' },
        });

        Swal.fire({
          title: 'Updated!',
          text: 'Product updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        // Add new product
        const response = await axios.post(`${BASE_URL}/products/add`, productData, {
          headers: { 'Content-Type': 'application/json' },
        });

        Swal.fire({
          title: 'Success!',
          text: 'Product added successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }

      // Refresh products and reset form
      fetchProducts();
      resetForm();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: `Operation failed: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await axios.delete(`${BASE_URL}/products/delete/${productId}`);
          
          // Update local state
          setProducts(products.filter((product) => product.id !== productId));
          
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: `Failed to delete product: ${error.message}`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  
  // Toggle shop visibility for a product
  const handleToggleShopVisibility = async (productId, currentValue) => {
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/products/toggle-shop/${productId}`, {
        showInShop: !currentValue
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, showInShop: !currentValue } : product
      ));
      
      Swal.fire({
        title: "Updated!",
        text: `Product ${!currentValue ? 'added to' : 'removed from'} shop.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to update shop visibility: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set single product stock to zero
  const handleSetStockToZero = async (productId, productName) => {
    Swal.fire({
      title: "Set Stock to Zero?",
      text: `Are you sure you want to set the stock of "${productName}" to zero?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, set to zero",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await axios.put(`${BASE_URL}/products/zero-stock/${productId}`, {
            stock: 0
          }, {
            headers: { 'Content-Type': 'application/json' },
          });
          
          // Update local state
          setProducts(products.map(product => 
            product.id === productId ? { ...product, stock: 0 } : product
          ));
          
          Swal.fire({
            title: "Updated!",
            text: "Product stock has been set to zero.",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: `Failed to update stock: ${error.message}`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Group products by carrier type (MTN, AIRTEL TIGO, TELECEL)
  const carrierGroups = useMemo(() => {
    const groups = {};
    
    products.forEach(product => {
      // Extract carrier name (ignore "-PREMIUM" suffix if present)
      let carrier = product.name.split('-')[0].trim();
      
      // Handle special case for AIRTEL TIGO which contains a space
      if (product.name.toUpperCase().includes('AIRTEL TIGO')) {
        carrier = 'AIRTEL TIGO';
      } else if (product.name.toUpperCase().includes('MTN')) {
        carrier = 'MTN';
      } else if (product.name.toUpperCase().includes('TELECEL')) {
        carrier = 'TELECEL';
      }
      
      if (!groups[carrier]) {
        groups[carrier] = [];
      }
      
      groups[carrier].push(product);
    });
    
    return groups;
  }, [products]);
  
  // Get unique carrier types
  const carrierTypes = useMemo(() => {
    return Object.keys(carrierGroups).filter(name => name);
  }, [carrierGroups]);

  // Reset stock for specific carrier type products
  const handleResetCarrierStock = async (carrier, stockValue) => {
    const actionText = stockValue === 0 ? "zero" : "one";
    const productsToUpdate = carrierGroups[carrier] || [];
    
    if (productsToUpdate.length === 0) {
      Swal.fire({
        title: "No Products Found",
        text: `No ${carrier} products found to update.`,
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }
    
    Swal.fire({
      title: `Set ${carrier} Stock to ${actionText}?`,
      text: `Are you sure you want to set stock for all ${carrier} products to ${actionText}? This will affect ${productsToUpdate.length} products.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, set to ${actionText}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          // Get IDs of all products for this carrier
          const productIds = productsToUpdate.map(product => product.id);
          
          // For each product, update stock value
          const updatePromises = productIds.map(id => 
            axios.put(`${BASE_URL}/products/update/${id}`, 
              { stock: stockValue },
              { headers: { 'Content-Type': 'application/json' } }
            )
          );
          
          await Promise.all(updatePromises);
          
          // Update local state
          setProducts(products.map(product => {
            if (productsToUpdate.some(p => p.id === product.id)) {
              return { ...product, stock: stockValue };
            }
            return product;
          }));
          
          Swal.fire({
            title: "Success!",
            text: `All ${carrier} product stock has been set to ${actionText}.`,
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: `Failed to update ${carrier} product stock. Please try again.`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };


  const handleResetAllStock = async (stockValue) => {
    const actionText = stockValue === 0 ? "zero" : "one";
    
    Swal.fire({
      title: `Reset ALL Stock to ${actionText}?`,
      text: `Are you sure you want to reset ALL product stock to ${actionText}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, set all to ${actionText}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const data = JSON.stringify({
            "stock": stockValue
          });
          
          const config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: `${BASE_URL}/products/reset-all-stock-to-zero`,
            headers: { 
              'Content-Type': 'application/json'
            },
            data: data
          };
          
          const response = await axios.request(config);
          //console.log(JSON.stringify(response.data));
          
          // Update local state - set all products stock to the specified value
          setProducts(products.map(product => ({ ...product, stock: stockValue })));
          
          Swal.fire({
            title: "Success!",
            text: `All product stock has been reset to ${actionText}.`,
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: `Failed to reset all stock to ${actionText}. Please try again.`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Toggle all products shop visibility (works with filtered results)
  const handleToggleAllShopVisibility = async () => {
    // Use filtered products if search is active, otherwise use all products
    const productsToUpdate = filteredProducts.length > 0 ? filteredProducts : products;
    
    if (productsToUpdate.length === 0) {
      Swal.fire({
        title: "No Products",
        text: "No products available to update.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }
    
    // Check if any of the filtered products are currently shown in shop
    const anyShownInShop = productsToUpdate.some(product => product.showInShop);
    const actionText = anyShownInShop ? "hide all products from" : "show all products in";
    const newValue = !anyShownInShop;
    const searchText = searchQuery ? ` matching "${searchQuery}"` : "";
    
    Swal.fire({
      title: `${anyShownInShop ? 'Hide All from Shop' : 'Show All in Shop'}?`,
      text: `Are you sure you want to ${actionText} the shop page? This will affect ${productsToUpdate.length} product${productsToUpdate.length !== 1 ? 's' : ''}${searchText}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: anyShownInShop ? "#d33" : "#0d9488",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${actionText}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          // Update only the filtered products
          const updatePromises = productsToUpdate.map(product => 
            axios.put(`${BASE_URL}/products/toggle-shop/${product.id}`, {
              showInShop: newValue
            }, {
              headers: { 'Content-Type': 'application/json' },
            })
          );
          
          await Promise.all(updatePromises);
          
          // Update local state - only update the products that were changed
          setProducts(products.map(product => {
            const wasUpdated = productsToUpdate.some(p => p.id === product.id);
            return wasUpdated ? { ...product, showInShop: newValue } : product;
          }));
          
          Swal.fire({
            title: "Success!",
            text: `${productsToUpdate.length} product${productsToUpdate.length !== 1 ? 's have' : ' has'} been ${anyShownInShop ? 'hidden from' : 'shown in'} the shop.`,
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: `Failed to update shop visibility. Please try again.`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };


  return (
    <Dialog
      open={isDialogOpenProduct}
      onClose={() => setIsDialogOpenProduct(false)}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl md:w-3/4 lg:w-2/3 mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {productId ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Products: <span className="font-medium">{products.length}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleResetAllStock(0)}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                title="Reset ALL products stock to zero"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4" />
                Set All to Zero
              </button>
              <button
                onClick={() => handleResetAllStock(1)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                title="Set ALL products stock to one"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4" />
                Set All to One
              </button>
              <button
                onClick={handleToggleAllShopVisibility}
                className={`flex items-center gap-1 ${products.some(p => p.showInShop) ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'} text-white px-3 py-2 rounded-md text-sm transition-colors`}
                title={products.some(p => p.showInShop) ? "Hide all products from shop" : "Show all products in shop"}
                disabled={isLoading}
              >
                <Store className="w-4 h-4" />
                {products.some(p => p.showInShop) ? 'Hide All from Shop' : 'Show All in Shop'}
              </button>
            </div>
            
            {/* Carrier-specific controls */}
            {carrierTypes.length > 0 && (
              <div className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                <div className="flex items-center gap-1 mb-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Set Stock by Carrier</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {carrierTypes.map(carrier => (
                    <div key={carrier} className="bg-white p-2 rounded shadow-sm border border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">{carrier}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleResetCarrierStock(carrier, 0)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs transition-colors"
                          disabled={isLoading}
                        >
                          Set 0
                        </button>
                        <button
                          onClick={() => handleResetCarrierStock(carrier, 1)}
                          className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs transition-colors"
                          disabled={isLoading}
                        >
                          Set 1
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <input type="hidden" value={productId || ""} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="border-gray-300 border rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-300 border rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHS)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border-gray-300 border rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="border-gray-300 border rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
        </div>
        
        <button
          onClick={handleSaveProduct}
          disabled={isLoading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : productId ? "Update Product" : "Add Product"}
        </button>

        {/* Products Table Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-800">Products List</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-48"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="text-xs text-gray-600">MTN</span>
                
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-2"></span>
                <span className="text-xs text-gray-600">AIRTEL TIGO</span>
                
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2"></span>
                <span className="text-xs text-gray-600">TELECEL</span>
              </div>
              
              <div className="bg-gray-100 px-3 py-1 rounded-md">
                <span className="text-sm text-gray-700">Showing: </span>
                <span className="font-bold text-blue-600">{filteredProducts.length}</span>
                <span className="text-sm text-gray-500"> / {products.length}</span>
              </div>
            </div>
          </div>
          <div className="border rounded-md w-full h-[400px] overflow-y-auto mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-4 text-center text-sm text-gray-500">
                      {isLoading ? (
                        <div className="flex justify-center items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading products...</span>
                        </div>
                      ) : searchQuery ? (
                        <div className="py-8">
                          <p className="text-gray-500 text-center">No products match "{searchQuery}"</p>
                          <p className="text-sm text-gray-400 text-center mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="py-8">
                          <p className="text-gray-500 text-center">No products found</p>
                          <p className="text-sm text-gray-400 text-center mt-1">Add a product to get started</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm text-gray-500">0000{product.id}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                        {product.name}
                        {product.name.toUpperCase().includes('MTN') && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-yellow-400" title="MTN"></span>
                        )}
                        {product.name.toUpperCase().includes('AIRTEL') && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" title="AIRTEL TIGO"></span>
                        )}
                        {product.name.toUpperCase().includes('TELECEL') && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" title="TELECEL"></span>
                        )}
                        {product.name.toUpperCase().includes('PREMIUM') && (
                          <span className="ml-1 text-xs text-white bg-purple-600 px-1 rounded">PREMIUM</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 truncate max-w-xs">{product.description}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">GHS {product.price.toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-center">
                        <button
                          onClick={() => handleToggleShopVisibility(product.id, product.showInShop)}
                          disabled={isLoading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                            product.showInShop ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                          title={product.showInShop ? 'Remove from shop' : 'Add to shop'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.showInShop ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-sm text-center">
                        <div className="flex justify-center gap-3">
                          <button 
                            className="text-blue-600 hover:text-blue-800" 
                            onClick={() => handleEditClick(product)}
                            title="Edit product"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800" 
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete product"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-orange-600 hover:text-orange-800" 
                            onClick={() => handleSetStockToZero(product.id, product.name)}
                            title="Set stock to zero"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Clear Form
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsDialogOpenProduct(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductDialog;