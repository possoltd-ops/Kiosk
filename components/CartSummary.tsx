
import React from 'react';
import { CartItem } from '../types';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface CartSummaryProps {
  items: CartItem[];
  currency: string;
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items, currency, onCheckout }) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 sm:left-1/4 p-6 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <button 
            onClick={onCheckout}
            className="w-full bg-[#1A1A1A] text-white p-4 rounded-full shadow-2xl flex items-center justify-between group transform hover:translate-y-[-4px] transition-all duration-300"
        >
          <div className="flex items-center gap-4 pl-2">
            <div className="bg-[#FF3355] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md relative">
              <ShoppingBag className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 bg-white text-[#FF3355] text-xs w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#1A1A1A]">
                {totalItems}
              </div>
            </div>
            <div className="text-left">
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total</div>
                <div className="text-2xl font-black tracking-tight">{currency}{totalPrice.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="flex items-center pr-4">
            <span className="text-lg font-bold mr-2 text-gray-200 group-hover:text-white transition-colors">VIEW ORDER</span>
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-[#FF3355] transition-colors duration-300">
                <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
