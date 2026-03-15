import { X, Minus, Plus, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CashierCatalogProduct,
  CashierCatalogVariant,
} from '../../lib/cashierCatalog';

interface ProductDetailModalProps {
  isDark: boolean;
  product: CashierCatalogProduct;
  onClose: () => void;
  onAddToCart?: (
    variant: CashierCatalogVariant,
    quantity: number,
    notes: string,
  ) => void;
  readOnly?: boolean;
  currency?: string; // <-- Add currency prop
}

export function ProductDetailModal({
  isDark,
  product,
  onClose,
  onAddToCart,
  readOnly = false,
  currency = 'EGP', // <-- Default to EGP if not provided
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants.find((variant) => variant.availableQuantity > 0)?.id || product.variants[0]?.id || '',
  );
  const defaultVariant = useMemo(
    () => product.variants.find((variant) => variant.availableQuantity > 0) || product.variants[0],
    [product],
  );

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) || defaultVariant,
    [defaultVariant, product.variants, selectedVariantId],
  );

  const effectiveMaxQuantity = selectedVariant?.availableQuantity || 0;
  const displayPrice = selectedVariant?.price ?? product.minPrice;

  const handleAddToCart = () => {
    if (!onAddToCart || !selectedVariant || effectiveMaxQuantity <= 0) return;
    onAddToCart(selectedVariant, Math.min(quantity, effectiveMaxQuantity), notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close product details"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
      />

      <div className="absolute inset-0 flex items-end md:items-stretch md:justify-end pointer-events-none">
        <div
          className={`relative w-full md:w-[440px] lg:w-[500px] max-h-[88vh] md:max-h-none md:h-full overflow-hidden border shadow-2xl pointer-events-auto ${isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/40'} rounded-t-3xl md:rounded-none md:rounded-l-3xl flex flex-col`}
        >
          <div className={`flex items-start gap-3 p-4 sm:p-5 border-b ${isDark ? 'border-[#2d2e33]' : 'border-gray-100'}`}>
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? 'bg-[#18191b]' : 'bg-gray-100'}`}>
              <img
                src={product.image_url || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {readOnly ? 'Product details' : 'Choose variant'}
              </p>
              <h2 className={`text-lg sm:text-xl font-semibold line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {product.name}
              </h2>
              <p className={`mt-1 text-xs sm:text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {product.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className={`px-2.5 py-1 rounded-full font-semibold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  {currency} {displayPrice.toFixed(2)}
                </span>
                <span className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-[#18191b] text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {product.variants.length} variant{product.variants.length === 1 ? '' : 's'}
                </span>
                <span className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-[#18191b] text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  Stock {effectiveMaxQuantity}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#18191b] text-gray-400' : 'hover:bg-slate-100 text-gray-600'}`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 sm:px-5 py-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Variants
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Tap to switch
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${isSelected
                        ? isDark
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
                          : 'border-blue-500 bg-blue-50 shadow-sm'
                        : isDark
                          ? 'border-[#2d2e33] bg-[#18191b] hover:bg-[#23252b]'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {variant.label}
                          </p>
                          <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {variant.availableQuantity} in stock
                          </p>
                        </div>
                        <p className={`text-sm font-semibold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {currency} {variant.price.toFixed(2)}
                        </p>
                      </div>
                      {isSelected && (
                        <p className={`mt-2 text-[11px] font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                          Selected variant
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <details className={`rounded-xl border ${isDark ? 'border-[#2d2e33] bg-[#18191b]' : 'border-gray-200 bg-gray-50'}`}>
              <summary className={`flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                More details
                <ChevronDown className="w-4 h-4" />
              </summary>
              <div className={`px-3 pb-3 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {product.description || 'No additional details available for this product.'}
              </div>
            </details>

            <div className={`rounded-xl border px-3 py-3 ${isDark ? 'border-[#2d2e33] bg-[#18191b]' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedVariant?.label || 'No variant selected'}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available stock: {effectiveMaxQuantity}
                  </p>
                </div>
                <p className={`text-base font-bold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {currency} {displayPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {readOnly ? null : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Quantity
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Max {effectiveMaxQuantity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#18191b] hover:bg-[#23252b] text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`w-10 text-center text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(effectiveMaxQuantity || 1, quantity + 1))}
                        disabled={effectiveMaxQuantity <= 0}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${effectiveMaxQuantity <= 0
                          ? 'bg-gray-300 text-white cursor-not-allowed'
                          : isDark
                            ? 'bg-[#18191b] hover:bg-[#23252b] text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Line total</p>
                      <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currency} {(displayPrice * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder="Add notes to your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-xs sm:text-sm resize-none focus:outline-none transition-colors ${isDark ? 'bg-[#18191b] border-[#2d2e33] text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                    rows={2}
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || effectiveMaxQuantity <= 0}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
