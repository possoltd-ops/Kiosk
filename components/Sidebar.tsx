import React from 'react';
import { Category } from '../types';

interface SidebarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategoryId, onSelectCategory }) => {
  return (
    <nav className="h-full w-full bg-white flex flex-col px-6 py-10 shadow-[5px_0_40px_rgba(0,0,0,0.03)] z-20 overflow-y-auto no-scrollbar border-r border-gray-100/50">
      <div className="mb-10 pl-4">
         <h2 className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">
            Menu
         </h2>
      </div>

      <div className="space-y-5 flex-1">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`
                w-full text-left h-24 px-8 rounded-full transition-all duration-300 ease-out flex items-center justify-between group relative
                ${isActive 
                  ? 'bg-[#FF3355] text-white shadow-[0_10px_30px_rgba(255,51,85,0.3)] scale-[1.02] translate-x-2' 
                  : 'bg-white text-gray-400 hover:bg-gray-50 border-2 border-transparent hover:border-gray-100'
                }
              `}
            >
              <span className={`text-xl font-black tracking-tight uppercase ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-800'}`}>
                {category.name}
              </span>
              
              {isActive && (
                <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 px-2">
         <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 text-center shadow-inner">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assistance</p>
            <p className="text-lg font-bold text-gray-900">Call Staff</p>
         </div>
      </div>
    </nav>
  );
};