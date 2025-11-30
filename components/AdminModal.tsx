
import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, GripVertical, Download, AlertCircle, CheckCircle, Server, Database, Edit3, Save, Tag, Utensils, Layers, Plus, Trash2, Copy, PlayCircle, FolderOpen, MoreVertical, Settings } from 'lucide-react';
import { Category, Product, ModifierGroup, MenuConfig } from '../types';

interface AdminModalProps {
  currentCategories?: Category[];
  currentProducts?: Product[];
  currentCurrency?: string;
  onClose: () => void;
  onUpdateMenu: (categories: Category[], products: Product[], currency: string) => void;
}

const PIN_CODE = '888';

// Helper to generate IDs for new items
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Data matching the screenshot structure
const DEMO_DATA = {
  menu: {
    categories: [
      {
        id: 101,
        name: "Main dishes",
        items: [
          {
            id: 1001,
            name: "Grilled Chicken Feast",
            price: 15.50,
            description: "Complete meal with choice of meat, sides and appetizers.",
            image_url: "https://loremflickr.com/600/400/grilled,chicken?random=101",
            option_groups: [
               {
                  id: 501,
                  name: "Choose the meat",
                  min_selection: 1,
                  max_selection: 1,
                  option_items: [
                      { id: 1, name: "Chicken Breast", price: 0 },
                      { id: 2, name: "Chicken Thighs", price: 0 },
                      { id: 3, name: "Spicy Wings (+2.00)", price: 2.00 }
                  ]
               },
               {
                  id: 502,
                  name: "Add a side dish",
                  min_selection: 0,
                  max_selection: 2,
                  option_items: [
                      { id: 4, name: "Steamed Rice", price: 2.00 },
                      { id: 5, name: "French Fries", price: 2.50 },
                      { id: 6, name: "Coleslaw", price: 1.50 }
                  ]
               },
               {
                  id: 503,
                  name: "How spicy?",
                  min_selection: 1,
                  max_selection: 1,
                  option_items: [
                      { id: 7, name: "Mild", price: 0 },
                      { id: 8, name: "Medium", price: 0 },
                      { id: 9, name: "Hot", price: 0 }
                  ]
               },
               {
                   id: 504,
                   name: "Choose the appetizer",
                   min_selection: 0,
                   max_selection: 1,
                   option_items: [
                       { id: 10, name: "Spring Rolls", price: 3.50 },
                       { id: 11, name: "Garlic Bread", price: 2.50 }
                   ]
               }
            ]
          }
        ]
      },
      {
          id: 102,
          name: "Sides",
          items: [
              {
                  id: 2001,
                  name: "Basmati Rice",
                  price: 3.00,
                  image_url: "https://loremflickr.com/600/400/rice?random=102",
              },
              {
                  id: 2002,
                  name: "Seasoned Fries",
                  price: 4.50,
                  image_url: "https://loremflickr.com/600/400/french,fries?random=103",
                  sizes: [
                    { id: 50, name: "Regular", price: 4.50 },
                    { id: 51, name: "Large", price: 5.95 }
                  ]
              }
          ]
      }
    ]
  }
};

// Robust mapping helper for GloriaFood structure
const mapGloriaFoodData = (gfData: any) => {
    const categories: Category[] = [];
    const products: Product[] = [];

    // Version 2 API structure usually returns { menu: { categories: [...] } } or { categories: [...] }
    let catsArray: any[] = [];
    
    if (gfData.categories && Array.isArray(gfData.categories)) {
        catsArray = gfData.categories;
    } else if (gfData.menu) {
        if (Array.isArray(gfData.menu.categories)) {
            catsArray = gfData.menu.categories;
        } else if (Array.isArray(gfData.menu)) {
            catsArray = gfData.menu; // Legacy array format
        }
    }

    if (!catsArray.length) {
        console.warn("No categories found in data", gfData);
        return { categories, products };
    }

    catsArray.forEach((cat: any) => {
        if (!cat) return;
        const catId = `cat_${cat.id}`;
        categories.push({
            id: catId,
            name: cat.name || 'Unnamed Category',
        });

        const items = cat.items || cat.products || [];
        if (Array.isArray(items)) {
            items.forEach((item: any) => {
                if (!item) return;
                
                const modifierGroups: ModifierGroup[] = [];
                let basePrice = item.price || 0;
                
                // 1. Handle Sizes (GloriaFood often treats sizes as top-level overrides)
                if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
                    basePrice = 0; // Reset base price as user MUST pick a size usually
                    const sizeOptions = item.sizes.map((size: any) => ({
                        id: `size_${size.id}`,
                        name: size.name,
                        price: size.price || 0
                    }));

                    modifierGroups.push({
                        id: `grp_size_${item.id}`,
                        name: "Size",
                        minSelection: 1, 
                        maxSelection: 1,
                        options: sizeOptions
                    });
                }

                // 2. Handle Option Groups (Standard Menu API)
                // Check multiple field names used by different versions of GloriaFood export
                const itemGroups = item.option_groups || item.groups || [];
                
                if (Array.isArray(itemGroups) && itemGroups.length > 0) {
                    itemGroups.forEach((optGroup: any) => {
                       // Mapping min/max selection safely
                       let minSel = 0;
                       if (optGroup.min_selection !== undefined) minSel = parseInt(optGroup.min_selection);
                       else if (optGroup.min_choice !== undefined) minSel = parseInt(optGroup.min_choice);
                       else if (optGroup.force_min !== undefined) minSel = parseInt(optGroup.force_min);

                       let maxSel = 1;
                       if (optGroup.max_selection !== undefined) maxSel = parseInt(optGroup.max_selection);
                       else if (optGroup.max_choice !== undefined) maxSel = parseInt(optGroup.max_choice);
                       else if (optGroup.force_max !== undefined) maxSel = parseInt(optGroup.force_max);
                       else if (optGroup.allow_multiselect) maxSel = 100; // Heuristic for older boolean flags

                       const optionsList = optGroup.option_items || optGroup.options || [];
                       
                       if (Array.isArray(optionsList) && optionsList.length > 0) {
                           const group: ModifierGroup = {
                               id: `grp_${optGroup.id || Math.random().toString(36).substr(2, 9)}`,
                               name: optGroup.name || 'Options',
                               minSelection: isNaN(minSel) ? 0 : minSel,
                               maxSelection: isNaN(maxSel) ? 1 : maxSel,
                               options: optionsList.map((optItem: any) => ({
                                   id: `opt_${optItem.id || Math.random().toString(36).substr(2, 9)}`,
                                   name: optItem.name || 'Option',
                                   price: optItem.price || 0
                               }))
                           };
                           modifierGroups.push(group);
                       }
                    });
                } 
                // 3. Fallback: Flat Options with 'group_name' (seen in Order Payloads)
                // If there are no option_groups but there IS an 'options' array
                else if (item.options && Array.isArray(item.options) && item.options.length > 0) {
                    const grouped: Record<string, any[]> = {};
                    const ungrouped: any[] = [];

                    item.options.forEach((opt: any) => {
                        if (opt.group_name) {
                            if (!grouped[opt.group_name]) grouped[opt.group_name] = [];
                            grouped[opt.group_name].push(opt);
                        } else {
                            ungrouped.push(opt);
                        }
                    });

                    // Add Grouped Options
                    Object.keys(grouped).forEach(gName => {
                        modifierGroups.push({
                            id: `grp_flat_${gName.replace(/\s+/g, '_')}_${generateId()}`,
                            name: gName,
                            minSelection: 0, // Cannot infer from flat list
                            maxSelection: 10,
                            options: grouped[gName].map(opt => ({
                                id: `opt_${opt.id || generateId()}`,
                                name: opt.name,
                                price: opt.price || 0
                            }))
                        });
                    });

                    // Add Ungrouped as "Extras" if present
                    if (ungrouped.length > 0) {
                        modifierGroups.push({
                            id: `grp_extras_${generateId()}`,
                            name: "Extras",
                            minSelection: 0,
                            maxSelection: ungrouped.length,
                            options: ungrouped.map(opt => ({
                                id: `opt_${opt.id || generateId()}`,
                                name: opt.name,
                                price: opt.price || 0
                            }))
                        });
                    }
                }
                
                // Construct Image fallback with LoremFlickr if needed
                const keyword = (item.name || 'food').split(' ')[0]; // use first word of item name
                const fallbackImage = `https://loremflickr.com/600/400/${encodeURIComponent(keyword)}?random=${item.id}`;

                products.push({
                    id: `prod_${item.id}`,
                    name: item.name || 'Unnamed Item',
                    price: basePrice,
                    description: item.description || '',
                    categoryId: catId,
                    imageUrl: item.image_url || fallbackImage,
                    modifierGroups: modifierGroups.length > 0 ? modifierGroups : undefined
                });
            });
        }
    });

    return { categories, products };
};

export const AdminModal: React.FC<AdminModalProps> = ({ 
    onClose, 
    onUpdateMenu, 
    currentCategories = [], 
    currentProducts = [],
    currentCurrency = '$'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'library' | 'sync' | 'edit'>('library');

  // Menu Library State
  const [menuLibrary, setMenuLibrary] = useState<MenuConfig[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Sync Logic State
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' });

  // Editor Logic State
  const [localMenuName, setLocalMenuName] = useState('');
  const [localCurrency, setLocalCurrency] = useState('$');
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Drag and Drop State
  const [isDragUnlocked, setIsDragUnlocked] = useState(false);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);

  // Initialize Library
  useEffect(() => {
    const savedMenus = localStorage.getItem('kiosk_menus');
    if (savedMenus) {
        try {
            const parsed = JSON.parse(savedMenus);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Migration: ensure currencySymbol exists
                const migrated = parsed.map(m => ({
                    ...m,
                    currencySymbol: m.currencySymbol || '$'
                }));
                setMenuLibrary(migrated);
                return;
            }
        } catch (e) {
            console.error("Failed to load menus", e);
        }
    }

    // Default Initialization if empty
    if (currentCategories.length > 0) {
        const defaultMenu: MenuConfig = {
            id: 'default_initial',
            name: 'Default Menu',
            currencySymbol: currentCurrency,
            categories: currentCategories,
            products: currentProducts,
            lastUpdated: new Date().toISOString()
        };
        setMenuLibrary([defaultMenu]);
        localStorage.setItem('kiosk_menus', JSON.stringify([defaultMenu]));
    }
  }, []); // Run once on mount

  const handlePinInput = (num: string) => {
    const newPin = pin + num;
    setPin(newPin);
    if (newPin === PIN_CODE) {
      setIsAuthenticated(true);
    } else if (newPin.length >= 3) {
      setTimeout(() => setPin(''), 300);
    }
  };

  // --- Library Functions ---

  const saveLibrary = (newLib: MenuConfig[]) => {
      setMenuLibrary(newLib);
      localStorage.setItem('kiosk_menus', JSON.stringify(newLib));
  };

  const deleteMenu = (id: string) => {
      if (confirm('Are you sure you want to delete this menu?')) {
          const newLib = menuLibrary.filter(m => m.id !== id);
          saveLibrary(newLib);
      }
  };

  const duplicateMenu = (id: string) => {
      const menu = menuLibrary.find(m => m.id === id);
      if (menu) {
          const newMenu: MenuConfig = {
              ...menu,
              id: `menu_${generateId()}`,
              name: `${menu.name} (Copy)`,
              lastUpdated: new Date().toISOString()
          };
          saveLibrary([...menuLibrary, newMenu]);
      }
  };

  const loadMenuToKiosk = (menu: MenuConfig) => {
      onUpdateMenu(menu.categories, menu.products, menu.currencySymbol || '$');
      setStatus({ type: 'success', message: `Menu "${menu.name}" is now live!` });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const startEditingMenu = (menu: MenuConfig) => {
      setEditingMenuId(menu.id);
      setLocalMenuName(menu.name);
      setLocalCurrency(menu.currencySymbol || '$');
      setLocalCategories(menu.categories);
      setLocalProducts(menu.products);
      if (menu.categories.length > 0) setSelectedCategoryId(menu.categories[0].id);
      setSelectedProductId(null);
      setActiveTab('edit');
      setIsDragUnlocked(false); // Reset drag state
  };

  const createNewMenu = () => {
      const newMenu: MenuConfig = {
          id: `menu_${generateId()}`,
          name: 'New Menu',
          currencySymbol: '$',
          categories: [],
          products: [],
          lastUpdated: new Date().toISOString()
      };
      saveLibrary([...menuLibrary, newMenu]);
      startEditingMenu(newMenu);
  };

  // --- Sync Functions ---
  const saveImportedMenu = (categories: Category[], products: Product[], sourceName: string) => {
      const newMenu: MenuConfig = {
          id: `menu_${generateId()}`,
          name: `${sourceName} - ${new Date().toLocaleDateString()}`,
          currencySymbol: '$', // Default import currency
          categories,
          products,
          lastUpdated: new Date().toISOString()
      };
      saveLibrary([...menuLibrary, newMenu]);
      setStatus({ type: 'success', message: 'Menu imported into Library.' });
      setTimeout(() => {
          setStatus({ type: null, message: '' });
          setActiveTab('library');
      }, 1000);
  };

  const loadDemoData = () => {
      setIsLoading(true);
      setTimeout(() => {
          const { categories, products } = mapGloriaFoodData(DEMO_DATA);
          saveImportedMenu(categories, products, 'Demo Menu');
          setIsLoading(false);
      }, 800);
  };

  const fetchGloriaFoodMenu = async () => {
    if (!apiKey) {
        setStatus({ type: 'error', message: 'Please enter an API Key.' });
        return;
    }
    setIsLoading(true);
    setStatus({ type: null, message: '' });
    const targetUrl = 'https://pos.globalfoodsoft.com/pos/menu';
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 
                'Authorization': apiKey.trim(),
                'Accept': 'application/json',
                'Glf-Api-Version': '2'
            }
        });
        if (!response.ok) throw new Error(`API Error ${response.status}`);
        const data = await response.json();
        const { categories, products } = mapGloriaFoodData(data);
        if (categories.length > 0) {
            saveImportedMenu(categories, products, 'GloriaFood Import');
        } else {
            setStatus({ type: 'error', message: 'Connected, but no menu items found.' });
        }
    } catch (error: any) {
        setStatus({ type: 'error', message: `Failed: ${error.message}. Ensure API Key is valid.` });
    }
    setIsLoading(false);
  };

  // --- Editor Functions ---
  const handleProductUpdate = (productId: string, updates: Partial<Product>) => {
      setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const saveEditorChanges = () => {
      if (!editingMenuId) return;
      
      const updatedLib = menuLibrary.map(m => {
          if (m.id === editingMenuId) {
              return {
                  ...m,
                  name: localMenuName,
                  currencySymbol: localCurrency,
                  categories: localCategories,
                  products: localProducts,
                  lastUpdated: new Date().toISOString()
              };
          }
          return m;
      });
      
      saveLibrary(updatedLib);
      setStatus({ type: 'success', message: 'Changes saved to library!' });
      setTimeout(() => setStatus({type: null, message: ''}), 2000);
  };

  // --- Drag and Drop Handlers ---
  const handleCategoryDragStart = (index: number) => {
    setDraggedCategoryIndex(index);
  };

  const handleCategoryDragEnter = (index: number) => {
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
    
    // Create a copy to mutate
    const newCategories = [...localCategories];
    const draggedItem = newCategories[draggedCategoryIndex];
    
    // Remove the item from its old position
    newCategories.splice(draggedCategoryIndex, 1);
    // Insert it at the new position
    newCategories.splice(index, 0, draggedItem);
    
    setLocalCategories(newCategories);
    setDraggedCategoryIndex(index);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategoryIndex(null);
  };

  // Derived state for Editor
  const filteredProducts = localProducts.filter(p => p.categoryId === selectedCategoryId);
  const selectedProduct = localProducts.find(p => p.id === selectedProductId);

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
          <div className="mb-6 p-4 bg-gray-100 rounded-full">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Back Office</h2>
          <p className="text-gray-400 mb-8 text-sm">Enter PIN to access settings</p>
          <div className="flex gap-4 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-gray-200 ${pin.length > i ? 'bg-[#FF3355] border-[#FF3355]' : 'bg-transparent'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 w-full mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 text-2xl font-bold text-gray-700 transition-colors"
              >
                {num}
              </button>
            ))}
            <div />
            <button
                onClick={() => handlePinInput('0')}
                className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 text-2xl font-bold text-gray-700 transition-colors"
              >
                0
            </button>
            <div />
          </div>
          <button onClick={onClose} className="text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-900">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-8">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Server className="text-[#FF3355]" /> Back Office
                    </h2>
                </div>
                {/* Navigation Tabs */}
                <div className="flex bg-white/10 rounded-full p-1">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'library' ? 'bg-[#FF3355] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Menu Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('sync')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'sync' ? 'bg-[#FF3355] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Import
                    </button>
                    {activeTab === 'edit' && (
                        <button 
                            className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-white/20 text-white shadow-lg animate-in fade-in"
                        >
                            Editor
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                 {status.message && (
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {status.message}
                    </div>
                )}
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex">

            {/* TAB: LIBRARY */}
            {activeTab === 'library' && (
                <div className="w-full h-full p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Saved Menus</h3>
                                <p className="text-gray-500 text-sm">Manage, edit, and publish your menus.</p>
                            </div>
                            <button 
                                onClick={createNewMenu}
                                className="bg-[#FF3355] text-white px-5 py-3 rounded-xl font-bold uppercase text-sm shadow-md hover:bg-[#E62E4D] transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create New
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {menuLibrary.length === 0 && (
                                <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400">
                                    <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>No menus saved. Import one or create new.</p>
                                </div>
                            )}

                            {menuLibrary.map((menu) => (
                                <div key={menu.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{menu.name}</h4>
                                            <p className="text-xs text-gray-400 font-mono mt-1">Last Updated: {new Date(menu.lastUpdated).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                                            {menu.products.length} items
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4 border-t border-gray-50 pt-4">
                                        <button 
                                            onClick={() => loadMenuToKiosk(menu)}
                                            className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-black transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle className="w-4 h-4" /> Make Live
                                        </button>
                                        <button 
                                            onClick={() => startEditingMenu(menu)}
                                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-xs uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" /> Edit
                                        </button>
                                    </div>
                                    
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => duplicateMenu(menu.id)}
                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-900" 
                                            title="Duplicate"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteMenu(menu.id)}
                                            className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* TAB: SYNC */}
            {activeTab === 'sync' && (
                <div className="w-full max-w-2xl mx-auto p-12 space-y-8 overflow-y-auto">
                     <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                        <AlertCircle className="w-8 h-8 text-blue-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">GloriaFood Integration</h3>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                Enter your <strong>Restaurant API Key</strong> below to fetch your live menu from the Cloud. 
                                <br/><span className="text-xs opacity-75">(Uses <code>pos.globalfoodsoft.com/pos/menu</code>)</span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Restaurant API Token
                        </label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="e.g. 8yCPCvb3dDo1k"
                            className="w-full h-16 px-6 bg-white border-2 border-gray-200 rounded-2xl font-mono text-gray-800 focus:outline-none focus:border-[#FF3355] transition-colors shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={loadDemoData}
                            disabled={isLoading}
                            className="h-20 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-lg uppercase tracking-wider hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <Database className="w-5 h-5" /> Load Demo
                        </button>

                        <button 
                            onClick={fetchGloriaFoodMenu}
                            disabled={isLoading}
                            className="h-20 bg-[#FF3355] text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-lg shadow-red-200 hover:bg-[#E62E4D] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Importing...</span>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" /> Import Menu
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: MENU EDITOR */}
            {activeTab === 'edit' && (
                <div className="flex w-full h-full">
                    {/* Column 1: Categories */}
                    <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsDragUnlocked(!isDragUnlocked)}
                                    className={`p-1.5 rounded-md transition-colors ${isDragUnlocked ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                                    title={isDragUnlocked ? "Lock Reordering" : "Unlock Reordering"}
                                >
                                    {isDragUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                                <button className="text-gray-400 hover:text-[#FF3355]"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {localCategories.map((cat, index) => (
                                <div
                                    key={cat.id}
                                    draggable={isDragUnlocked}
                                    onDragStart={() => handleCategoryDragStart(index)}
                                    onDragEnter={() => handleCategoryDragEnter(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={handleCategoryDragEnd}
                                    className={`
                                        group relative w-full rounded-xl transition-all duration-200
                                        ${isDragUnlocked ? 'cursor-move' : ''}
                                        ${draggedCategoryIndex === index ? 'opacity-50 scale-95 bg-gray-100' : ''}
                                    `}
                                >
                                    <button
                                        onClick={() => {
                                            if (!isDragUnlocked) {
                                                setSelectedCategoryId(cat.id);
                                                setSelectedProductId(null);
                                            }
                                        }}
                                        className={`
                                            w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3
                                            ${selectedCategoryId === cat.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 bg-transparent'}
                                        `}
                                    >
                                        {isDragUnlocked && (
                                            <GripVertical className={`w-4 h-4 shrink-0 ${selectedCategoryId === cat.id ? 'text-gray-500' : 'text-gray-300'}`} />
                                        )}
                                        <span className="truncate">{cat.name}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Products List */}
                    <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
                         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Products</h3>
                            <button className="text-gray-400 hover:text-[#FF3355]"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                             {filteredProducts.map(prod => (
                                <button
                                    key={prod.id}
                                    onClick={() => setSelectedProductId(prod.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all border-2 ${selectedProductId === prod.id ? 'bg-[#FF3355]/5 border-[#FF3355] z-10' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                >
                                    <div className={`text-sm font-bold ${selectedProductId === prod.id ? 'text-[#FF3355]' : 'text-gray-800'}`}>
                                        {prod.name}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">
                                        {localCurrency}{prod.price.toFixed(2)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Edit Form */}
                    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
                         <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Edit3 className="w-4 h-4" /> {selectedProduct ? 'Editing Item' : 'Menu Settings'}
                            </h3>
                            <button 
                                onClick={saveEditorChanges}
                                className="bg-[#FF3355] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#E62E4D] transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8">
                            {selectedProduct ? (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product Name</label>
                                                <input 
                                                    type="text" 
                                                    value={selectedProduct.name}
                                                    onChange={(e) => handleProductUpdate(selectedProduct.id, { name: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-[#FF3355] outline-none"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Base Price ({localCurrency})</label>
                                                <input 
                                                    type="number" 
                                                    value={selectedProduct.price}
                                                    onChange={(e) => handleProductUpdate(selectedProduct.id, { price: parseFloat(e.target.value) || 0 })}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:border-[#FF3355] outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-[#FF3355] uppercase mb-2">Discount Price ({localCurrency})</label>
                                                <input 
                                                    type="number" 
                                                    value={selectedProduct.discountPrice || ''}
                                                    placeholder="Optional"
                                                    onChange={(e) => handleProductUpdate(selectedProduct.id, { discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                    className="w-full p-4 bg-red-50 border border-red-100 rounded-xl font-mono text-red-600 focus:border-[#FF3355] outline-none placeholder:text-red-200"
                                                />
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                                                <textarea 
                                                    value={selectedProduct.description || ''}
                                                    onChange={(e) => handleProductUpdate(selectedProduct.id, { description: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 h-24 resize-none focus:border-[#FF3355] outline-none"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Allergens (Comma Separated)</label>
                                                 <input 
                                                    type="text" 
                                                    value={selectedProduct.allergens?.join(', ') || ''}
                                                    placeholder="e.g. Nuts, Dairy, Shellfish"
                                                    onChange={(e) => handleProductUpdate(selectedProduct.id, { allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#FF3355] outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Tag className="w-5 h-5 text-[#FF3355]" /> Upsell / Recommendation
                                        </h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Recommended Product to Add</label>
                                                <select 
                                                    value={selectedProduct.upsell?.productId || ''}
                                                    onChange={(e) => {
                                                        const pid = e.target.value;
                                                        if (!pid) {
                                                            handleProductUpdate(selectedProduct.id, { upsell: undefined });
                                                        } else {
                                                            const existingPrice = selectedProduct.upsell?.offerPrice || 0;
                                                            handleProductUpdate(selectedProduct.id, { upsell: { productId: pid, offerPrice: existingPrice } });
                                                        }
                                                    }}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#FF3355] outline-none"
                                                >
                                                    <option value="">-- No Recommendation --</option>
                                                    {localProducts.filter(p => p.id !== selectedProduct.id).map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({localCurrency}{p.price})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {selectedProduct.upsell && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Special Offer Price ({localCurrency})</label>
                                                    <input 
                                                        type="number" 
                                                        value={selectedProduct.upsell.offerPrice}
                                                        onChange={(e) => {
                                                            if (selectedProduct.upsell) {
                                                                handleProductUpdate(selectedProduct.id, { 
                                                                    upsell: { ...selectedProduct.upsell, offerPrice: parseFloat(e.target.value) || 0 } 
                                                                });
                                                            }
                                                        }}
                                                        className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl font-mono text-yellow-800 focus:border-yellow-500 outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Layers className="w-5 h-5 text-[#FF3355]" /> Modifier Groups
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    const newGroup: ModifierGroup = {
                                                        id: `grp_${generateId()}`,
                                                        name: 'New Group',
                                                        minSelection: 0,
                                                        maxSelection: 1,
                                                        options: []
                                                    };
                                                    const currentGroups = selectedProduct.modifierGroups || [];
                                                    handleProductUpdate(selectedProduct.id, { modifierGroups: [...currentGroups, newGroup] });
                                                }}
                                                className="text-xs font-bold uppercase bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Group
                                            </button>
                                        </div>

                                        {(!selectedProduct.modifierGroups || selectedProduct.modifierGroups.length === 0) ? (
                                            <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 text-sm">
                                                No modifier groups defined. Add one to allow customizations.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedProduct.modifierGroups.map((group, gIndex) => (
                                                    <div key={group.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                                        {/* Group Header Controls */}
                                                        <div className="grid grid-cols-12 gap-4 mb-4 items-end">
                                                            <div className="col-span-5">
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Group Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={group.name}
                                                                    onChange={(e) => {
                                                                        const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                        newGroups[gIndex] = { ...newGroups[gIndex], name: e.target.value };
                                                                        handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                    }}
                                                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-[#FF3355]"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min</label>
                                                                <input
                                                                    type="number"
                                                                    value={group.minSelection}
                                                                    onChange={(e) => {
                                                                        const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                        newGroups[gIndex] = { ...newGroups[gIndex], minSelection: parseInt(e.target.value) || 0 };
                                                                        handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                    }}
                                                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-[#FF3355]"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Max</label>
                                                                <input
                                                                    type="number"
                                                                    value={group.maxSelection}
                                                                    onChange={(e) => {
                                                                        const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                        newGroups[gIndex] = { ...newGroups[gIndex], maxSelection: parseInt(e.target.value) || 0 };
                                                                        handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                    }}
                                                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-[#FF3355]"
                                                                />
                                                            </div>
                                                            <div className="col-span-3 flex justify-end">
                                                                <button
                                                                    onClick={() => {
                                                                        const newGroups = selectedProduct.modifierGroups!.filter((_, i) => i !== gIndex);
                                                                        handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                    }}
                                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete Group"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Options List */}
                                                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                                            {group.options.map((opt, oIndex) => (
                                                                <div key={opt.id} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={opt.name}
                                                                        placeholder="Option Name"
                                                                        onChange={(e) => {
                                                                            const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                            const newOptions = [...newGroups[gIndex].options];
                                                                            newOptions[oIndex] = { ...newOptions[oIndex], name: e.target.value };
                                                                            newGroups[gIndex] = { ...newGroups[gIndex], options: newOptions };
                                                                            handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                        }}
                                                                        className="flex-1 p-2 bg-white border border-gray-100 rounded text-sm focus:border-[#FF3355] outline-none"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        value={opt.price}
                                                                        placeholder="0.00"
                                                                        onChange={(e) => {
                                                                            const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                            const newOptions = [...newGroups[gIndex].options];
                                                                            newOptions[oIndex] = { ...newOptions[oIndex], price: parseFloat(e.target.value) || 0 };
                                                                            newGroups[gIndex] = { ...newGroups[gIndex], options: newOptions };
                                                                            handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                        }}
                                                                        className="w-20 p-2 bg-white border border-gray-100 rounded text-sm font-mono focus:border-[#FF3355] outline-none"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                             const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                             const newOptions = newGroups[gIndex].options.filter((_, i) => i !== oIndex);
                                                                             newGroups[gIndex] = { ...newGroups[gIndex], options: newOptions };
                                                                             handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                        }}
                                                                        className="p-2 text-gray-300 hover:text-red-500"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => {
                                                                    const newGroups = [...(selectedProduct.modifierGroups || [])];
                                                                    const newOptions = [...newGroups[gIndex].options, { id: `opt_${generateId()}`, name: '', price: 0 }];
                                                                    newGroups[gIndex] = { ...newGroups[gIndex], options: newOptions };
                                                                    handleProductUpdate(selectedProduct.id, { modifierGroups: newGroups });
                                                                }}
                                                                className="text-xs font-bold text-[#FF3355] hover:underline mt-2 flex items-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" /> Add Option
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <Utensils className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg font-bold">Select a product to edit</p>
                                    <p className="text-sm">or change Menu Settings above</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
