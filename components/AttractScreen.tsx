import React from 'react';
import { ChevronRight, Utensils, Settings } from 'lucide-react';

interface AttractScreenProps {
  onStart: () => void;
  onAdminClick: () => void;
}

export const AttractScreen: React.FC<AttractScreenProps> = ({ onStart, onAdminClick }) => {
  return (
    <div 
      className="relative w-full h-full bg-gray-900 overflow-hidden cursor-pointer select-none group"
      onClick={onStart}
    >
      {/* Background Image with Scale Animation */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img 
          src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=2110&auto=format&fit=crop"
          alt="Dining Background"
          className="w-full h-full object-cover opacity-70 transition-transform duration-[40s] ease-linear transform scale-100 group-hover:scale-110" 
        />
        {/* Dark overlay gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      {/* Admin Button (Hidden/Subtle) */}
      <div 
        className="absolute top-0 right-0 p-8 z-50"
        onClick={(e) => {
            e.stopPropagation();
            onAdminClick();
        }}
      >
        <div className="w-12 h-12 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Settings className="text-white/50 w-6 h-6" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
        
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 md:p-20 text-center max-w-3xl w-full shadow-2xl relative overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
          
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FF3355] mb-10 shadow-[0_0_50px_rgba(255,51,85,0.5)] animate-bounce">
             <Utensils className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
            TOUCH TO <br />
            <span className="text-[#FF3355]">START</span>
          </h1>

          <div className="h-1.5 w-24 bg-[#FF3355] mx-auto rounded-full mb-10 shadow-[0_0_20px_rgba(255,51,85,0.5)]" />

          <p className="text-xl md:text-2xl text-gray-200 font-medium tracking-widest uppercase mb-12 drop-shadow-md">
            Tap anywhere to begin your order
          </p>

          <div className="inline-flex items-center justify-center gap-3 bg-white text-[#FF3355] px-12 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg shadow-white/5 transform group-active:scale-95">
             Order Now <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      {/* Bottom Branding / Info */}
      <div className="absolute bottom-12 w-full text-center z-20">
        <p className="text-white/40 text-xs font-bold tracking-[0.4em] uppercase">
            Kiosk Eats • Self Service Station
        </p>
      </div>
    </div>
  );
};