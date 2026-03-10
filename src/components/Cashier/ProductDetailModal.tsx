import { X, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../../lib/database.types';

interface ProductDetailModalProps {
  isDark: boolean;
  product: Product;
  onClose: () => void;
  onAddToCart: (quantity: number, notes: string) => void;
}

export function ProductDetailModal({
  isDark,
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAddToCart = () => {
    onAddToCart(quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className={`rounded-2xl max-w-sm w-full p-4 sm:p-6 relative shadow-2xl border pointer-events-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <h2 className={`text-base sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Detail Menu</h2>

        <div className={`aspect-square rounded-xl overflow-hidden mb-3 sm:mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <img
            src={product.image_url || ''}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
          <p className={`text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>
          <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="mb-3 sm:mb-4">
          <textarea
            placeholder="Add notes to your order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className={`w-10 sm:w-12 text-center text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
        >
          Add to Cart (${(product.price * quantity).toFixed(2)})
        </button>
      </div>
    </div>
  );
}
