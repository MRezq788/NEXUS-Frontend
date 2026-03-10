import { useState } from 'react';
import { usePOS } from '../contexts/POSContext';
import { useTheme } from '../contexts/ThemeContext';
import { POSHeader } from '../components/Cashier/POSHeader';
import { CategoryTabs } from '../components/Cashier/CategoryTabs';
import { ProductGrid } from '../components/Cashier/ProductGrid';
import { OrderPanel } from '../components/Cashier/OrderPanel';
import { ProductDetailModal } from '../components/Cashier/ProductDetailModal';
import { SidebarMenu } from '../components/Cashier/SidebarMenu';
import { TrackOrder } from '../components/Cashier/TrackOrder';
import { mockCategories, mockProducts, mockTables } from '../lib/mockData';
import type { Product } from '../lib/database.types';

export function PointOfSale() {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('#1000');

  const { addToCart, clearCart, cartItems } = usePOS();

  const filteredProducts = selectedCategory
      ? mockProducts.filter((p) => p.category_id === selectedCategory)
      : mockProducts;

  const handleProductClick = (product: Product) => {
    // Open modal to view product details
    setSelectedProduct(product);
  };

  const handleAddToCart = (quantity: number, notes: string) => {
    if (selectedProduct) {
      addToCart(selectedProduct as Product, quantity, notes);
      setSelectedProduct(null); // Close modal after adding
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const newOrderNumber = `#${(parseInt(orderNumber.slice(1)) + 1).toString().padStart(4, '0')}`;
    setOrderNumber(newOrderNumber);
    clearCart();
    alert('Order placed successfully!');
  };

  const handleCloseOrder = () => {
    if (cartItems.length > 0) {
      if (confirm('Are you sure you want to close this order? All items will be cleared.')) {
        clearCart();
      }
    }
  };

  const activeOrders = [
    { customer: 'Mike', table: 'Table 04', status: 'Dine In', time: '10:00 AM' },
    { customer: 'Billie', table: 'Table 03', status: 'Take Away', time: '08:45 AM' },
    { customer: 'Richard', table: 'Table 02', status: 'Dine In', time: '09:15 AM' },
    { customer: 'Sharon', table: 'Table 01', status: 'Take Away', time: '08:15 AM' },
    { customer: 'James', table: 'Table 05', status: 'Dine In', time: '10:20 AM' },
    { customer: 'Olivia', table: 'Table 06', status: 'Take Away', time: '09:50 AM' },
    { customer: 'Ethan', table: 'Table 07', status: 'Dine In', time: '11:05 AM' },
    { customer: 'Sophia', table: 'Table 08', status: 'Take Away', time: '10:35 AM' },
    { customer: 'Liam', table: 'Table 09', status: 'Dine In', time: '11:30 AM' },
    { customer: 'Ava', table: 'Table 10', status: 'Take Away', time: '09:00 AM' },
    { customer: 'Noah', table: 'Table 11', status: 'Dine In', time: '10:45 AM' },
    { customer: 'Emma', table: 'Table 12', status: 'Take Away', time: '08:30 AM' },
  ];

  return (
      <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100'}`}>
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header - part of left content column */}
            <POSHeader isDark={isDark} onMenuClick={() => setIsSidebarOpen(true)} onCloseOrder={handleCloseOrder} />

            {/* Category Tabs - Scrollable on mobile */}
            <div className={`px-3 sm:px-4 md:px-6 pt-4 pb-2 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CategoryTabs
                  isDark={isDark}
                  categories={mockCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Products Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 scrollbar-hide">
              <ProductGrid
                  isDark={isDark}
                  products={filteredProducts}
                  categories={mockCategories}
                  onProductClick={handleProductClick}
              />
            </div>

            {/* Active Orders Tracker - part of left content column */}
            <div className="hidden lg:block  px-3 sm:px-4 md:px-6 pb-4">
              <TrackOrder isDark={isDark} activeOrders={activeOrders} />
            </div>
          </div>

          {/* Order Panel - Hidden on mobile, shown as sidebar on tablet+ */}
          <div className="hidden md:flex h-full">
            <OrderPanel
                isDark={isDark}
                tables={mockTables}
                orderNumber={orderNumber}
                onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>

        {/* Mobile Floating Cart Button - Only visible on mobile */}
        {cartItems.length > 0 && (
          <div className="md:hidden fixed bottom-4 right-4 z-20">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <span className="font-semibold">View Cart</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'}`}>
                {cartItems.length}
              </span>
            </button>
          </div>
        )}


        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            isDark={isDark}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Sidebar Menu */}
        <SidebarMenu isDark={isDark} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
  );
}
