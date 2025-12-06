"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { toast } from "sonner";

interface ProductInfo {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize?: string;
  image?: string;
  nutritionGrade?: string;
}

interface BarcodeScannerProps {
  onProductFound: (product: ProductInfo) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onProductFound, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [productData, setProductData] = useState<ProductInfo | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerContainerId = "barcode-scanner-container";
  const isStoppingRef = useRef(false);

  const stopScanning = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // Only stop if scanner is actually running (state 2 = SCANNING)
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        // Clear the scanner UI
        if (state !== Html5QrcodeScannerState.NOT_STARTED) {
          scannerRef.current.clear();
        }
      } catch (err) {
        // Silently ignore - scanner may already be stopped
        console.debug("Scanner cleanup:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    isStoppingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanning = async () => {
    if (scannerRef.current || isStoppingRef.current) return;

    setError(null);

    try {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      setScanning(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        async (decodedText) => {
          console.log("Barcode detected:", decodedText);
          await stopScanning();
          await fetchProductData(decodedText);
        },
        () => {
          // Ignore scan errors - they happen continuously until barcode is found
        }
      );
    } catch (err: unknown) {
      console.error("Failed to start scanner:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      setScanning(false);
      scannerRef.current = null;
    }
  };

  const fetchProductData = async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,nutriments,serving_size,nutrition_grades,image_url`,
        {
          headers: {
            "User-Agent": "FiMyra/1.0 (health-wellness-app)",
          },
        }
      );

      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutriments = product.nutriments || {};

        const productInfo: ProductInfo = {
          name: product.product_name || "Unknown Product",
          brand: product.brands,
          calories: Math.round(nutriments["energy-kcal_100g"] || nutriments["energy_100g"] / 4.184 || 0),
          protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
          fiber: Math.round((nutriments.fiber_100g || 0) * 10) / 10,
          servingSize: product.serving_size,
          image: product.image_url,
          nutritionGrade: product.nutrition_grades?.toUpperCase(),
        };

        setProductData(productInfo);
        toast.success(`Found: ${productInfo.name}`);
      } else {
        setError("Product not found in database. Try entering details manually.");
        toast.error("Product not found");
      }
    } catch (err: any) {
      console.error("Failed to fetch product:", err);
      setError("Failed to fetch product data. Please try again.");
      toast.error("Failed to fetch product data");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }
    await fetchProductData(manualBarcode.trim());
  };

  const handleAddProduct = () => {
    if (productData) {
      onProductFound(productData);
      onClose();
    }
  };

  const getNutritionGradeColor = (grade?: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-lime-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-500",
    };
    return colors[grade || ""] || "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 w-full max-w-lg border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
              📷
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Scan Food Barcode</h3>
              <p className="text-white/60 text-sm">Get nutrition info instantly</p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Scanner Area */}
        {!productData && (
          <>
            <div className="relative w-full h-64 bg-black/50 rounded-2xl overflow-hidden mb-4">
              {/* Scanner container - must be empty for html5-qrcode to manage */}
              <div
                id={scannerContainerId}
                ref={containerRef}
                className="w-full h-full"
              />
              {/* Overlay when not scanning */}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">📱</span>
                    <p className="text-white/60">Click "Start Scanning" to use camera</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-3 mb-6">
              {!scanning ? (
                <motion.button
                  onClick={startScanning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Start Scanning
                </motion.button>
              ) : (
                <motion.button
                  onClick={stopScanning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop Scanning
                </motion.button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-white/40 text-sm">or enter manually</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Manual Entry */}
            <div className="flex gap-3">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode number..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <motion.button
                onClick={handleManualSearch}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Search"
                )}
              </motion.button>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && !productData && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">Fetching product information...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Product Result */}
        <AnimatePresence>
          {productData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Product Info Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-400/20">
                <div className="flex gap-4">
                  {productData.image && (
                    <img
                      src={productData.image}
                      alt={productData.name}
                      className="w-20 h-20 object-cover rounded-xl bg-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white truncate">{productData.name}</h4>
                    {productData.brand && (
                      <p className="text-white/60 text-sm">{productData.brand}</p>
                    )}
                    {productData.nutritionGrade && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-white/60 text-xs">Nutri-Score:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getNutritionGradeColor(
                            productData.nutritionGrade
                          )}`}
                        >
                          {productData.nutritionGrade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nutrition Facts */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h5 className="text-white font-semibold mb-3">Nutrition per 100g</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 border border-orange-400/20">
                    <p className="text-white/60 text-xs">Calories</p>
                    <p className="text-white text-xl font-bold">{productData.calories} <span className="text-sm font-normal">kcal</span></p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-3 border border-blue-400/20">
                    <p className="text-white/60 text-xs">Protein</p>
                    <p className="text-white text-xl font-bold">{productData.protein}g</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-3 border border-yellow-400/20">
                    <p className="text-white/60 text-xs">Carbs</p>
                    <p className="text-white text-xl font-bold">{productData.carbs}g</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-3 border border-green-400/20">
                    <p className="text-white/60 text-xs">Fat</p>
                    <p className="text-white text-xl font-bold">{productData.fat}g</p>
                  </div>
                </div>
                {productData.fiber !== undefined && productData.fiber > 0 && (
                  <div className="mt-3 text-white/60 text-sm">
                    Fiber: {productData.fiber}g
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setProductData(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                >
                  Scan Another
                </motion.button>
                <motion.button
                  onClick={handleAddProduct}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Meal
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeScanner;
