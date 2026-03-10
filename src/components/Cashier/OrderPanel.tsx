import { CreditCard as Edit, Minus, Plus, SmilePlus, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { usePOS } from '../../contexts/POSContext';
import type { RestaurantTable } from '../../lib/database.types';

interface OrderPanelProps {
  isDark: boolean;
  tables: RestaurantTable[];
  orderNumber: string;
  onPlaceOrder: () => void;
}

export function OrderPanel({ isDark, tables, orderNumber, onPlaceOrder }: OrderPanelProps) {
  const {
    cartItems,
    updateQuantity,
    subtotal,
    tax,
    discount,
    total,
    selectedTable,
    setSelectedTable,
    orderType,
    setOrderType,
    customerName,
    promoCode,
    setPromoCode,
  } = usePOS();

  const [promoInput, setPromoInput] = useState('');

  const handlePromoApply = () => {
    if (promoInput.trim()) {
      setPromoCode(promoInput.trim());
      setPromoInput('');
    }
  };

  return (
    <div className={`w-full md:w-96 lg:w-[400px] border-l flex flex-col h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`p-3 sm:p-4 border-b ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h2 className={`font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {customerName || "Customer's Name"}
            </h2>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order #{orderNumber}</p>
          </div>
          <button className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Table and Order Type Selection */}
        <div className="flex gap-2">
          <select
            value={selectedTable || ''}
            onChange={(e) => setSelectedTable(e.target.value)}
            className={`flex-1 px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
          >
            <option value="">Select Table</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.table_number}
              </option>
            ))}
          </select>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className={`flex-1 px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
          >
            <option>Dine In</option>
            <option>Take Away</option>
            <option>Delivery</option>
          </select>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <SmilePlus className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
            </div>
            <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>No items selected</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add products to start</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-2 sm:gap-3">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <img
                    src={item.product.image_url || ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.product.name}
                      </h3>
                      <p className={`text-sm sm:text-base font-semibold ${isDark ? 'text-blue-400' : 'text-gray-900'}`}>
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    {item.notes && (
                      <button className={`p-1 rounded transition-colors flex-shrink-0 ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`w-8 text-center text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Totals and Checkout */}
      <div className={`p-3 sm:p-4 border-t space-y-2 sm:space-y-3 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tax (10%)</span>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Discount</span>
            <span className="font-medium text-green-600">
              -${discount.toFixed(2)}
            </span>
          </div>
        )}
        <div className={`flex justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>TOTAL</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>

        {/* Promo and Payment Method */}
        <div className="flex gap-2 pt-2">
          {promoCode ? (
            <div className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg flex items-center justify-between ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-500 text-green-700'}`}>
              <span className="text-xs sm:text-sm font-medium">Promo Applied ✓</span>
              <CheckCircle className="w-4 h-4" />
            </div>
          ) : (
            <>
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePromoApply()}
                placeholder="Promo code..."
                className={`flex-1 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
              <button
                onClick={handlePromoApply}
                className={`px-3 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <SmilePlus className="w-4 h-4" />
                Apply
              </button>
            </>
          )}
        </div>

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          disabled={cartItems.length === 0}
          className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-sm sm:text-base shadow-lg disabled:shadow-none"
        >
          {cartItems.length === 0 ? 'Add Items First' : `Place Order - $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
