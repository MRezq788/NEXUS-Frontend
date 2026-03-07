import { Search } from 'lucide-react';
import { useState } from 'react';
import type { Product, Category } from '../../lib/database.types';

interface ProductGridProps {
  isDark: boolean;
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({
  isDark,
  products,
  categories,
  onProductClick,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (categoryId: string | null) => {
    const categoryMap: Record<string, string> = {
      Sandwich: 'text-red-600',
      Pastries: 'text-teal-600',
      Donuts: 'text-amber-600',
      Cakes: 'text-pink-600',
      Breads: 'text-blue-600',
    };

    const category = categories.find((c) => c.id === categoryId);
    return category ? categoryMap[category.name] || 'text-gray-600' : 'text-gray-600';
  };

  const getCategoryName = (categoryId: string | null) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
          />
        </div>
      </div>

      {/* Products Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className={`rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 hover:shadow-lg transition-all text-left group ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:shadow-xl'}`}
          >
            <div className={`aspect-square rounded-lg overflow-hidden mb-2 sm:mb-3 ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <img
                src={product.image_url || ''}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
            <h3 className={`font-medium text-xs sm:text-sm mb-1 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h3>
            <p
              className={`text-xs font-medium mb-1 sm:mb-2 ${getCategoryColor(
                product.category_id
              )}`}
            >
              {getCategoryName(product.category_id)}
            </p>
            <p className={`text-base sm:text-lg font-bold ${isDark ? 'text-blue-400' : 'text-gray-900'}`}>
              ${product.price.toFixed(2)}
            </p>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Search className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No products found</p>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
