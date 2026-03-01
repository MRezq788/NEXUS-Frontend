// src/components/warehouse/BatchUploadModal.tsx
import { useState, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import type { Product } from "../../config/types";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (products: Partial<Product>[]) => void;
  isLoading: boolean;
}

export const BatchUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  isLoading,
}: BatchUploadModalProps) => {
  const { isDark } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [previewData, setPreviewData] = useState<Partial<Product>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFileName("");
    setParseError("");
    setPreviewData([]);
    setDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text: string): Partial<Product>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const nameIdx = headers.findIndex(h => h.includes('name') || h === 'product');
    const categoryIdx = headers.findIndex(h => h.includes('category'));
    const quantityIdx = headers.findIndex(h => h.includes('quantity') || h === 'qty');
    const unitIdx = headers.findIndex(h => h.includes('unit'));
    const priceIdx = headers.findIndex(h => h.includes('price'));
    const descriptionIdx = headers.findIndex(h => h.includes('description') || h === 'desc');

    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      const name = nameIdx >= 0 ? values[nameIdx] : '';
      const quantityStr = quantityIdx >= 0 ? values[quantityIdx] : '';
      const priceStr = priceIdx >= 0 ? values[priceIdx] : '';
      
      if (!name || name === '') continue;
      
      const quantity = parseFloat(quantityStr);
      const price = parseFloat(priceStr);
      
      if (isNaN(quantity) || isNaN(price)) continue;

      products.push({
        name: name,
        category: categoryIdx >= 0 ? values[categoryIdx] || 'Uncategorized' : 'Uncategorized',
        quantity: quantity,
        unit: unitIdx >= 0 ? values[unitIdx] || 'kg' : 'kg',
        price: price,
        description: descriptionIdx >= 0 ? values[descriptionIdx] || '' : '',
      });
    }

    return products;
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setParseError('Please upload a valid CSV file');
      return;
    }

    setFileName(file.name);
    setParseError("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const products = parseCSV(text);
        setPreviewData(products);
        if (products.length === 0) {
          setParseError('No valid products found in CSV. Ensure product names exist and quantity/price are valid numbers.');
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
        setPreviewData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Batch Upload Products
        </h3>
        
        <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Upload a CSV file with columns: <strong>Product Name, Category, Quantity, Unit, Price, Description</strong>
          <br />
          <span className="text-xs opacity-75">Products will only be added if they have a name and valid numeric quantity/price.</span>
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? isDark
                ? "border-blue-500 bg-blue-500/10"
                : "border-blue-500 bg-blue-50"
              : isDark
              ? "border-gray-700 hover:border-gray-600"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            aria-label="Upload CSV file"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="text-4xl mb-2">📄</div>
          <p className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {fileName ? fileName : "Drag & drop your CSV file here"}
          </p>
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`font-medium underline ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              browse files
            </button>
          </p>
        </div>

        {/* Error Message */}
        {parseError && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{parseError}</span>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-6">
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Preview ({previewData.length} valid products found)
            </h4>
            <div className={`max-h-48 overflow-y-auto rounded-lg border ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <table className="w-full text-sm">
                <thead className={`sticky top-0 ${
                  isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                }`}>
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? "divide-gray-700 text-gray-300" : "divide-gray-200 text-gray-700"
                }`}>
                  {previewData.slice(0, 5).map((product, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{product.name}</td>
                      <td className="px-3 py-2">{product.category}</td>
                      <td className="px-3 py-2">{product.quantity}</td>
                      <td className="px-3 py-2">{product.unit}</td>
                      <td className="px-3 py-2">${product.price?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {previewData.length > 5 && (
                    <tr>
                      <td colSpan={5} className={`px-3 py-2 text-center italic ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        ...and {previewData.length - 5} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={() => onUpload(previewData)}
            disabled={isLoading || previewData.length === 0}
            className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            } disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>Upload {previewData.length > 0 && `(${previewData.length})`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};