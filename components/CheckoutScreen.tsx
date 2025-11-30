
import React, { useState } from 'react';
import { CartItem } from '../types';
import { ArrowLeft, CreditCard, Minus, Plus, Trash2, SlidersHorizontal } from 'lucide-react';

interface CheckoutScreenProps {
  cart: CartItem[];
  currency: string;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onBack: () => void;
  onPay: () => void;
  onEditItem: (index: number) => void;
  onClearCart: () => void;
}

const TIP_OPTIONS = [0, 5, 10, 15];

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ 
  cart,
  currency,
  onUpdateQuantity, 
  onBack, 
  onPay,
  onEditItem,
  onClearCart
}) => {
  const [tipPercentage, setTipPercentage] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tipAmount = subtotal * (tipPercentage / 100);
  const total = subtotal + tipAmount;

  return (
    <div className="h-screen w-full bg-[#F8F9FA] flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-gray-100 flex-shrink-0 z-10 shadow-sm flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Your Order</h1>
            <p className="text-gray-400 font-medium">Review your items before payment</p>
        </div>
        {cart.length > 0 && (
            <button 
                onClick={onClearCart}
                className="flex items-center gap-2 text-[#FF3355] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 px-5 py-3 rounded-full transition-colors"
            >
                <Trash2 className="w-5 h-5" /> Empty Basket
            </button>
        )}
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {/* Empty State */}
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <p className="text-2xl font-bold text-gray-400 uppercase">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`} 
                  className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col sm:flex-row items-center gap-6"
                >
                  {/* Image */}
                  <div className="w-full sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <div className="flex flex-col mb-2">
                        <h3 className="text-xl font-black text-gray-900 uppercase leading-none mb-1">{item.name}</h3>
                        {item.description && (
                            <p className="text-gray-400 text-sm font-medium line-clamp-1">{item.description}</p>
                        )}
                    </div>

                    {item.options && item.options.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                        {item.options.map((opt, i) => (
                          <span key={i} className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-wider border border-gray-100">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                        <div className="text-[#FF3355] font-bold text-lg">
                        {currency}{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button 
                            onClick={() => onEditItem(index)}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <SlidersHorizontal className="w-3 h-3" /> Customise
                        </button>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1.5 border border-gray-100 mt-2 sm:mt-0">
                    <button 
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${item.quantity === 1 ? 'bg-red-50 text-red-500' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
                    >
                      {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" strokeWidth={3} />}
                    </button>
                    <span className="w-6 text-center font-bold text-xl text-gray-900 tabular-nums">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-white text-gray-900 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tipping Section */}
          {cart.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6">Support our team</h3>
              <div className="grid grid-cols-4 gap-4">
                {TIP_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercentage(pct)}
                    className={`
                      h-16 rounded-2xl font-black text-lg transition-all duration-200 border-2
                      ${tipPercentage === pct 
                        ? 'bg-[#FF3355] border-[#FF3355] text-white shadow-lg scale-105' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {pct === 0 ? 'No Tip' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {cart.length > 0 && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-gray-400 font-medium">
                   <span>Subtotal</span>
                   <span>{currency}{subtotal.toFixed(2)}</span>
                </div>
                {tipPercentage > 0 && (
                    <div className="flex justify-between items-center text-gray-400 font-medium">
                        <span>Tip ({tipPercentage}%)</span>
                        <span>{currency}{tipAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between items-center">
                   <span className="text-xl font-bold text-gray-900 uppercase">Total</span>
                   <span className="text-4xl font-black text-[#FF3355] tracking-tighter">{currency}{total.toFixed(2)}</span>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-100 p-6 md:p-8 shrink-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 h-24">
          <button 
            onClick={onBack}
            className="flex-1 bg-white text-gray-900 border-2 border-gray-100 rounded-[2rem] font-bold text-xl uppercase tracking-wider hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" /> Back to Menu
          </button>
          
          <button 
            onClick={onPay}
            disabled={cart.length === 0}
            className="flex-[2] bg-[#FF3355] text-white rounded-[2rem] font-black text-2xl uppercase tracking-wider shadow-xl shadow-red-200 hover:bg-[#E62E4D] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay Now <CreditCard className="w-7 h-7" />
          </button>
        </div>
      </div>

    </div>
  );
};
