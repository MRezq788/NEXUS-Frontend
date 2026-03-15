import { Minus, Plus, SmilePlus } from 'lucide-react';
import { usePOS } from '../../contexts/POSContext';

interface OrderPanelProps {
  isDark: boolean;
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
  currency?: string;
}

export function OrderPanel({
  isDark,
  onPlaceOrder,
  isPlacingOrder = false,
  currency = 'EGP',
}: OrderPanelProps) {
  const {
    cartItems,
    updateQuantity,
    total,
  } = usePOS();

  return (
    <div className={`w-full md:w-96 lg:w-[400px] border-l flex flex-col h-full ${isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/30'}`}>
      {/* Header */}
      <div className={`p-3 sm:p-4 border-b ${isDark ? 'bg-[#18191b] border-[#2d2e33]' : 'bg-slate-50 border-gray-200'}`}>
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h2 className={`font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Order Summary
            </h2>
          </div>
        </div>

      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-[#18191b]' : 'bg-gray-100'}`}>
              <SmilePlus className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
            </div>
            <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>No items selected</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add products to start</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item) => {
              const maxQuantity = item.product.maxQuantity ?? Number.POSITIVE_INFINITY;
              const isAtMax = Number.isFinite(maxQuantity) && item.quantity >= maxQuantity;

              return (
              <div key={item.product.id} className="flex gap-2 sm:gap-3">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? 'bg-[#18191b]' : 'bg-gray-100'}`}>
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
                      <p className={`text-[11px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.product.variantLabel}
                      </p>
                      <p className={`text-sm sm:text-base font-semibold ${isDark ? 'text-blue-400' : 'text-gray-900'}`}>
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#18191b] hover:bg-[#23252b] text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
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
                      disabled={isAtMax}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors text-white ${isAtMax ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {Number.isFinite(maxQuantity) && (
                    <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Available: {maxQuantity}
                    </p>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Footer - Totals and Checkout */}
      <div className={`p-3 sm:p-4 border-t space-y-2 sm:space-y-3 ${isDark ? 'bg-[#18191b] border-[#2d2e33]' : 'bg-slate-50 border-gray-200'}`}>
        <div className={`flex justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t ${isDark ? 'border-[#2d2e33]' : 'border-gray-200'}`}>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>TOTAL</span>
          <span className="text-blue-600">{total.toFixed(2)} {currency}</span>
        </div>

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          disabled={cartItems.length === 0 || isPlacingOrder}
          className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-sm sm:text-base shadow-lg disabled:shadow-none"
        >
          {isPlacingOrder
            ? 'Placing Order...'
            : cartItems.length === 0
              ? 'Add Items First'
              : `Place Order - ${total.toFixed(2)} ${currency}`}
        </button>
      </div>
    </div>
  );
}
