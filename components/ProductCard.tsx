
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Minus, SlidersHorizontal, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  onAdd: (product: Product, quantity: number) => void;
  onClick: (product: Product, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currency, onAdd, onClick }) => {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if product has explicit modifier groups (from Admin/API)
    const hasModifierGroups = product.modifierGroups && product.modifierGroups.length > 0;
    
    // Check for implicit options based on category (Legacy fallback for demo data)
    // We assume main dishes might have the hardcoded "Spice/Upgrade" options available in ProductModal
    const hasLegacyOptions = ['chicken', 'rice-dishes'].includes(product.categoryId);

    if (hasModifierGroups || hasLegacyOptions) {
        onClick(product, quantity);
        // We don't reset quantity here in case user cancels the modal
    } else {
        onAdd(product, quantity);
        setQuantity(1); // Reset only on successful direct add
    }
  };

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="group bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full border border-gray-100/50 relative">
      
      {/* Clickable Area for Modal */}
      <div className="cursor-pointer" onClick={() => onClick(product, quantity)}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl mb-5 bg-gray-100">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.calories && (
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm z-10">
                  {product.calories} KCAL
              </div>
          )}
          {hasDiscount && (
              <div className="absolute top-3 right-3 bg-[#FF3355] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> SALE
              </div>
          )}
          
          {/* Edit Icon Overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <div className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <SlidersHorizontal className="w-4 h-4" /> Customise
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col mb-4">
            <h3 className="text-xl font-black text-gray-900 uppercase leading-tight mb-2 tracking-tight">
            {product.name}
            </h3>
            
            {product.description && (
            <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
                {product.description}
            </p>
            )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                {hasDiscount && (
                    <span className="text-sm font-bold text-gray-400 line-through">
                        {currency}{product.price.toFixed(2)}
                    </span>
                )}
                <span className={`text-2xl font-black ${hasDiscount ? 'text-[#FF3355]' : 'text-[#FF3355]'}`}>
                    {currency}{currentPrice!.toFixed(2)}
                </span>
            </div>
        </div>

        <div className="flex gap-3 h-12">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-gray-100 rounded-full px-1 w-32 shrink-0">
                <button 
                    onClick={(e) => { e.stopPropagation(); decrement(); }}
                    className={`w-10 h-10 rounded-full bg-white text-gray-900 shadow-sm flex items-center justify-center transition-all active:scale-90 ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    disabled={quantity <= 1}
                >
                    <Minus className="w-4 h-4" strokeWidth={3} />
                </button>
                <span className="font-bold text-lg text-gray-900 w-8 text-center tabular-nums">{quantity}</span>
                <button 
                     onClick={(e) => { e.stopPropagation(); increment(); }}
                     className="w-10 h-10 rounded-full bg-white text-gray-900 shadow-sm flex items-center justify-center transition-all hover:shadow-md active:scale-90"
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={handleAdd}
              className="flex-1 bg-[#FF3355] text-white rounded-full flex items-center justify-center font-bold tracking-wide uppercase shadow-lg shadow-red-200 active:scale-95 transition-all duration-200 hover:bg-[#E62E4D]"
            >
              Add
            </button>
        </div>
      </div>
    </div>
  );
};
