
import React, { useState } from 'react';
import { Product, ModifierGroup, ModifierOption } from '../types';
import { X, Flame, Plus, Check, CupSoda, UtensilsCrossed, ChevronDown, Info, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  allProducts?: Product[];
  currency: string;
  onClose: () => void;
  onAddToOrder: (product: Product, quantity: number, options: string[]) => void;
  initialOptions?: string[];
  initialQuantity?: number;
  mode?: 'add' | 'edit';
}

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild', color: 'text-green-500' },
  { id: 'medium', label: 'Medium', color: 'text-orange-500' },
  { id: 'hot', label: 'Hot', color: 'text-red-600' }
];

const UPGRADES = [
  { id: 'fries', label: 'Fries', price: 2.00, icon: <UtensilsCrossed className="w-6 h-6" /> },
  { id: 'rice', label: 'Rice', price: 2.00, icon: <UtensilsCrossed className="w-6 h-6" /> },
  { id: 'noodles', label: 'Noodles', price: 3.00, icon: <UtensilsCrossed className="w-6 h-6" /> }
];

const DRINKS = [
  { id: 'cola', label: 'Cola', icon: <CupSoda className="w-6 h-6" /> },
  { id: '7up', label: '7UP', icon: <CupSoda className="w-6 h-6" /> },
  { id: 'water', label: 'Water', icon: <CupSoda className="w-6 h-6" /> }
];

export const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  allProducts = [],
  currency,
  onClose, 
  onAddToOrder,
  initialOptions = [],
  initialQuantity = 1,
  mode = 'add'
}) => {
  // Use baseProduct to avoid double-adding prices if product is a CartItem (which has an inflated total price)
  // We want to always start calculating from the clean base price.
  const baseProduct = allProducts.find(p => p.id === product.id) || product;

  const hasDynamicModifiers = baseProduct.modifierGroups && baseProduct.modifierGroups.length > 0;
  
  // Determine if legacy options should be shown (if no dynamic modifiers exist)
  // Prevent showing spice levels for drinks/desserts
  const showLegacyOptions = !hasDynamicModifiers && ['chicken', 'rice-dishes'].includes(baseProduct.categoryId);
  
  const hasDiscount = baseProduct.discountPrice !== undefined && baseProduct.discountPrice < baseProduct.price;
  const basePrice = hasDiscount ? baseProduct.discountPrice! : baseProduct.price;

  // Resolve Upsell Product
  const upsellItem = baseProduct.upsell && allProducts.find(p => p.id === baseProduct.upsell!.productId);

  const getInitialSpice = () => {
    const spiceOption = initialOptions.find(o => o.startsWith('Spice: '));
    if (spiceOption) {
      const id = spiceOption.replace('Spice: ', '');
      const found = SPICE_LEVELS.find(s => s.id === id);
      return found ? found.id : 'medium';
    }
    return 'medium';
  };
  const getInitialUpgrades = () => {
    return UPGRADES.filter(u => initialOptions.includes(u.label)).map(u => u.id);
  };
  const getInitialDrink = () => {
    const drinkOption = initialOptions.find(o => o.startsWith('Drink: '));
    if (drinkOption) {
      const label = drinkOption.replace('Drink: ', '');
      const found = DRINKS.find(d => d.label === label);
      return found ? found.id : null;
    }
    return null;
  };

  const [quantity, setQuantity] = useState(initialQuantity);
  const [addUpsell, setAddUpsell] = useState(false);
  
  // Legacy State
  const [spiceLevel, setSpiceLevel] = useState<string>(getInitialSpice);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>(getInitialUpgrades);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(getInitialDrink);

  const [dynamicSelections, setDynamicSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    if (hasDynamicModifiers) {
        baseProduct.modifierGroups!.forEach(group => {
            const groupSelections: string[] = [];
            group.options.forEach(opt => {
                if (initialOptions.includes(opt.name)) {
                    groupSelections.push(opt.id);
                }
            });
            initial[group.id] = groupSelections;
        });
    }
    return initial;
  });

  const toggleLegacyUpgrade = (id: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleDynamicOption = (groupId: string, optionId: string, group: ModifierGroup) => {
    setDynamicSelections(prev => {
        const current = prev[groupId] || [];
        const isSelected = current.includes(optionId);
        
        if (group.maxSelection === 1) {
            return { ...prev, [groupId]: [optionId] };
        } else {
            if (isSelected) {
                return { ...prev, [groupId]: current.filter(id => id !== optionId) };
            } else {
                if (current.length >= group.maxSelection && group.maxSelection > 0) {
                     return prev;
                }
                return { ...prev, [groupId]: [...current, optionId] };
            }
        }
    });
  };

  // Calculates the price of a single unit including all selected modifiers
  const getUnitPrice = () => {
    let total = basePrice;

    if (hasDynamicModifiers) {
        baseProduct.modifierGroups!.forEach(group => {
            const selections = dynamicSelections[group.id] || [];
            selections.forEach(selId => {
                const opt = group.options.find(o => o.id === selId);
                if (opt) total += opt.price;
            });
        });
    } else if (showLegacyOptions) {
        selectedUpgrades.forEach(upId => {
            const upgrade = UPGRADES.find(u => u.id === upId);
            if (upgrade) total += upgrade.price;
        });
    }
    return total;
  };

  const calculateTotal = () => {
    let grandTotal = getUnitPrice() * quantity;
    
    if (addUpsell && upsellItem && baseProduct.upsell) {
        grandTotal += (baseProduct.upsell.offerPrice * 1);
    }

    return grandTotal;
  };

  const handleAddToOrder = () => {
    let options: string[] = [];

    if (hasDynamicModifiers) {
        baseProduct.modifierGroups!.forEach(group => {
            const selections = dynamicSelections[group.id] || [];
            selections.forEach(selId => {
                const opt = group.options.find(o => o.id === selId);
                if (opt) options.push(opt.name);
            });
        });
    } else if (showLegacyOptions) {
        options = [
            `Spice: ${spiceLevel}`,
            ...selectedUpgrades.map(id => UPGRADES.find(u => u.id === id)?.label || id),
            selectedDrink ? `Drink: ${DRINKS.find(d => d.id === selectedDrink)?.label}` : null
        ].filter(Boolean) as string[];
    }
    
    // Calculate the full unit price (Base + Modifiers)
    const unitPrice = getUnitPrice();

    // Create product object for cart with the UPDATED unit price.
    // We clone baseProduct to ensure we have the clean original structure, but override the price.
    const productToAdd = { ...baseProduct, price: unitPrice };
    
    onAddToOrder(productToAdd, quantity, options);

    if (addUpsell && upsellItem && baseProduct.upsell) {
        const upsellToAdd = { ...upsellItem, price: baseProduct.upsell.offerPrice };
        onAddToOrder(upsellToAdd, 1, []);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 shrink-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-2">
              {baseProduct.name}
            </h2>
            <div className="flex items-center gap-2">
                <p className="text-gray-400 font-medium text-lg">
                {mode === 'edit' ? 'Update your preferences' : 'Customise your meal'}
                </p>
                {baseProduct.allergens && baseProduct.allergens.length > 0 && (
                    <div className="flex gap-1 ml-2">
                        {baseProduct.allergens.map((alg, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                                {alg}
                            </span>
                        ))}
                    </div>
                )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          
          {baseProduct.description && (
             <div className="bg-gray-50 p-4 rounded-xl text-gray-600 italic border border-gray-100">
                 {baseProduct.description}
             </div>
          )}

          {hasDynamicModifiers ? (
            <div className="space-y-8">
                {baseProduct.modifierGroups!.map(group => (
                    <section key={group.id}>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <ChevronDown className="w-4 h-4 text-[#FF3355]" /> {group.name} 
                           {group.maxSelection > 1 && <span className="text-xs normal-case bg-gray-100 px-2 py-0.5 rounded text-gray-500">Select up to {group.maxSelection}</span>}
                           {group.maxSelection === 1 && <span className="text-xs normal-case bg-gray-100 px-2 py-0.5 rounded text-gray-500">Select 1</span>}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {group.options.map(option => {
                                const isSelected = (dynamicSelections[group.id] || []).includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleDynamicOption(group.id, option.id, group)}
                                        className={`
                                            flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left
                                            ${isSelected 
                                                ? 'bg-[#FF3355]/5 border-[#FF3355] shadow-md' 
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div>
                                            <div className={`font-bold uppercase tracking-tight ${isSelected ? 'text-[#FF3355]' : 'text-gray-800'}`}>
                                                {option.name}
                                            </div>
                                            {option.price > 0 && (
                                                <div className="text-sm text-gray-400 font-medium">
                                                    +{currency}{option.price.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#FF3355] border-[#FF3355]' : 'border-gray-200'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
          ) : showLegacyOptions ? (
            <>
                {/* Legacy hardcoded modifiers - Only shown for default products with no custom groups */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#FF3355]" /> Spice Level
                    </h3>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        {SPICE_LEVELS.map(level => (
                            <button
                                key={level.id}
                                onClick={() => setSpiceLevel(level.id)}
                                className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase transition-all ${spiceLevel === level.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#FF3355]" /> Upgrades
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {UPGRADES.map(upgrade => {
                            const active = selectedUpgrades.includes(upgrade.id);
                            return (
                                <button
                                    key={upgrade.id}
                                    onClick={() => toggleLegacyUpgrade(upgrade.id)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${active ? 'border-[#FF3355] bg-red-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'bg-[#FF3355] border-[#FF3355]' : 'border-gray-200'}`}>
                                        {active && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">{upgrade.label}</div>
                                        <div className="text-xs text-gray-500 font-medium">+{currency}{upgrade.price.toFixed(2)}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
                
                <section>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CupSoda className="w-4 h-4 text-[#FF3355]" /> Choice of Drink
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {DRINKS.map(drink => (
                            <button
                                key={drink.id}
                                onClick={() => setSelectedDrink(drink.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${selectedDrink === drink.id ? 'border-[#FF3355] bg-red-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className={selectedDrink === drink.id ? 'text-[#FF3355]' : 'text-gray-400'}>
                                    {drink.icon}
                                </div>
                                <span className={`text-xs font-bold uppercase ${selectedDrink === drink.id ? 'text-[#FF3355]' : 'text-gray-500'}`}>
                                    {drink.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <Info className="w-12 h-12 mb-2" />
                <p>No customisation options available for this item.</p>
             </div>
          )}

          {/* Upsell / Perfect Pairing Section */}
          {upsellItem && baseProduct.upsell && (
             <section className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Sparkles className="w-32 h-32 text-yellow-500" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                     <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden shadow-md shrink-0">
                         <img src={upsellItem.imageUrl} alt={upsellItem.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 text-center sm:text-left">
                         <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                             <span className="bg-yellow-400 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Perfect Pair</span>
                             <h4 className="font-black text-gray-900 uppercase">Add {upsellItem.name}?</h4>
                         </div>
                         <p className="text-sm text-gray-600 mb-2 font-medium">Get it for a special price!</p>
                         <div className="flex items-center justify-center sm:justify-start gap-3">
                             <span className="text-xs text-gray-400 line-through font-bold">{currency}{upsellItem.price.toFixed(2)}</span>
                             <span className="text-xl font-black text-[#FF3355]">{currency}{baseProduct.upsell.offerPrice.toFixed(2)}</span>
                         </div>
                     </div>
                     <button
                        onClick={() => setAddUpsell(!addUpsell)}
                        className={`
                            h-12 px-6 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2
                            ${addUpsell 
                                ? 'bg-[#FF3355] text-white' 
                                : 'bg-white text-gray-900 border-2 border-transparent hover:border-yellow-300'
                            }
                        `}
                     >
                         {addUpsell ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                         {addUpsell ? 'Added' : 'Add Deal'}
                     </button>
                 </div>
             </section>
          )}

        </div>

        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 shrink-0">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            <div className="flex items-center bg-white rounded-full p-2 shadow-sm border border-gray-100">
               <button 
                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
                 className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
               >
                 <span className="text-2xl font-bold text-gray-600 mb-1">-</span>
               </button>
               <span className="w-16 text-center text-2xl font-black text-gray-900">{quantity}</span>
               <button 
                 onClick={() => setQuantity(quantity + 1)}
                 className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
               >
                 <span className="text-2xl font-bold text-gray-600 mb-1">+</span>
               </button>
            </div>

            <button 
              onClick={handleAddToOrder}
              className="flex-1 w-full bg-[#FF3355] text-white h-20 rounded-[2rem] flex items-center justify-between px-8 shadow-xl shadow-red-200 hover:shadow-red-300 hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-300"
            >
              <span className="text-xl font-black uppercase tracking-wider">
                {mode === 'edit' ? 'Update Order' : 'Add to Order'}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-xl text-xl font-bold">
                {currency}{calculateTotal().toFixed(2)}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
