
import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface MenuGridProps {
  products: Product[];
  categoryName: string;
  currency: string;
  onAddProduct: (product: Product, quantity: number) => void;
  onProductClick: (product: Product, quantity?: number) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ products, categoryName, currency, onAddProduct, onProductClick }) => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar p-8 pb-32">
      <header className="mb-8 flex items-end justify-between">
        <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
            {categoryName}
            </h2>
            <p className="text-gray-400 font-medium text-lg">
                Choose your meal
            </p>
        </div>
        <div className="hidden md:block">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                {products.length} Items Available
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard 
                product={product} 
                currency={currency}
                onAdd={onAddProduct} 
                onClick={onProductClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
