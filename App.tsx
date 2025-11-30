
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MenuGrid } from './components/MenuGrid';
import { CartSummary } from './components/CartSummary';
import { AttractScreen } from './components/AttractScreen';
import { ProductModal } from './components/ProductModal';
import { CheckoutScreen } from './components/CheckoutScreen';
import { AdminModal } from './components/AdminModal';
import { CATEGORIES as INITIAL_CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { CartItem, Product, Category, ViewState } from './types';

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.ATTRACT_SCREEN);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  
  // Menu Data State (Dynamic)
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currency, setCurrency] = useState('$');

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
        setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Filter products based on active category
  const activeProducts = useMemo(() => {
    return products.filter(p => p.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  const activeCategoryName = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId)?.name || 'Menu';
  }, [activeCategoryId, categories]);

  const handleUpdateMenu = (newCategories: Category[], newProducts: Product[], newCurrency: string) => {
      setCategories(newCategories);
      setProducts(newProducts);
      setCurrency(newCurrency);
      if (newCategories.length > 0) {
          // Check if active category still exists, if not, reset
          if (!newCategories.find(c => c.id === activeCategoryId)) {
               setActiveCategoryId(newCategories[0].id);
          }
      }
      setCart([]); // Clear cart to avoid ID conflicts
  };

  const handleAddToCart = (product: Product, quantity: number = 1, options: string[] = []) => {
    setCart(prevCart => {
      let currentCart = [...prevCart];
      
      // If editing, remove the original item first so we can re-evaluate merging
      if (editingItemIndex !== null) {
         currentCart = currentCart.filter((_, i) => i !== editingItemIndex);
      }

      // Check if item exists with EXACT same options
      const existingItemIndex = currentCart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.options?.sort()) === JSON.stringify(options.sort())
      );

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
        return currentCart;
      }
      return [...currentCart, { ...product, quantity, options }];
    });
    
    // Close modal and reset edit state
    setSelectedProduct(null);
    setEditingItemIndex(null);
    setModalQuantity(1);
  };

  const handleUpdateCartItem = (index: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter((_, i) => i !== index);
      }
      const newCart = [...prevCart];
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const handleEditCartItem = (index: number) => {
    setEditingItemIndex(index);
    setSelectedProduct(cart[index]);
  };

  const handleProductSelect = (product: Product, quantity: number = 1) => {
    setSelectedProduct(product);
    setModalQuantity(quantity);
    setEditingItemIndex(null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setEditingItemIndex(null);
    setModalQuantity(1);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setViewState(ViewState.CHECKOUT);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePayment = () => {
    alert('Payment processing... (Demo)');
    setCart([]);
    setViewState(ViewState.ATTRACT_SCREEN);
  };

  if (viewState === ViewState.ATTRACT_SCREEN) {
    return (
        <>
            <AttractScreen 
                onStart={() => setViewState(ViewState.ORDERING)} 
                onAdminClick={() => setShowAdmin(true)}
            />
            {showAdmin && (
                <AdminModal 
                    currentCategories={categories}
                    currentProducts={products}
                    currentCurrency={currency}
                    onClose={() => setShowAdmin(false)}
                    onUpdateMenu={handleUpdateMenu}
                />
            )}
        </>
    );
  }

  if (viewState === ViewState.CHECKOUT) {
    return (
      <>
        <CheckoutScreen 
          cart={cart}
          currency={currency}
          onUpdateQuantity={handleUpdateCartItem}
          onBack={() => setViewState(ViewState.ORDERING)}
          onPay={handlePayment}
          onEditItem={handleEditCartItem}
          onClearCart={handleClearCart}
        />
        {/* Render Modal on Checkout Screen if editing */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct}
            allProducts={products}
            currency={currency}
            onClose={handleCloseModal} 
            onAddToOrder={handleAddToCart}
            initialOptions={editingItemIndex !== null ? cart[editingItemIndex].options : []}
            initialQuantity={editingItemIndex !== null ? cart[editingItemIndex].quantity : 1}
            mode={editingItemIndex !== null ? 'edit' : 'add'}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#F8F9FA] overflow-hidden selection:bg-[#FF3355] selection:text-white animate-in fade-in duration-500 relative">
      {/* Sidebar Container - Fixed Width */}
      <div className="w-1/4 max-w-xs h-full border-r border-gray-100 bg-white z-20 relative hidden sm:block shadow-lg">
        <Sidebar 
          categories={categories}
          activeCategoryId={activeCategoryId} 
          onSelectCategory={setActiveCategoryId} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative flex flex-col">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="sm:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
             <span className="font-black text-xl uppercase italic">Kiosk<span className="text-[#FF3355]">Eats</span></span>
             <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[60%]">
                 {categories.map(cat => (
                     <button 
                        key={cat.id} 
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-[#FF3355] text-white' : 'bg-gray-100 text-gray-500'}`}
                     >
                         {cat.name}
                     </button>
                 ))}
             </div>
        </div>

        <MenuGrid 
          products={activeProducts} 
          categoryName={activeCategoryName} 
          currency={currency}
          onAddProduct={handleAddToCart}
          onProductClick={handleProductSelect}
        />
        
        {/* Gradient Overlay at bottom for smooth scrolling behind cart button */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8F9FA] to-transparent pointer-events-none" />
      </main>

      <CartSummary items={cart} currency={currency} onCheckout={handleCheckout} />

      {/* Product Customization Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          allProducts={products}
          currency={currency}
          onClose={handleCloseModal} 
          onAddToOrder={handleAddToCart}
          initialQuantity={modalQuantity}
        />
      )}
    </div>
  );
}

export default App;
