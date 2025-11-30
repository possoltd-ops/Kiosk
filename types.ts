
export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl: string;
  categoryId: string;
  calories?: number;
  modifierGroups?: ModifierGroup[];
  
  // New Fields for Enhanced Features
  allergens?: string[];
  discountPrice?: number;
  upsell?: {
    productId: string;
    offerPrice: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem extends Product {
  quantity: number;
  options?: string[];
}

export interface MenuConfig {
  id: string;
  name: string;
  currencySymbol: string;
  categories: Category[];
  products: Product[];
  lastUpdated: string;
}

export enum ViewState {
  ATTRACT_SCREEN = 'ATTRACT_SCREEN',
  ORDERING = 'ORDERING',
  CHECKOUT = 'CHECKOUT'
}
