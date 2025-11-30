
import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  { id: 'chicken', name: 'Chicken' },
  { id: 'rice-dishes', name: 'Rice Dishes' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'sides', name: 'Sides' },
];

export const PRODUCTS: Product[] = [
  // Chicken Category
  {
    id: 'c1',
    name: '6 Pcs Chicken',
    price: 12.99,
    categoryId: 'chicken',
    imageUrl: 'https://loremflickr.com/600/400/fried,chicken?random=1',
    calories: 850,
    description: 'Crispy fried chicken, original blend of herbs.'
  },
  {
    id: 'c2',
    name: 'Chicken Rice Box',
    price: 9.50,
    categoryId: 'chicken',
    imageUrl: 'https://loremflickr.com/600/400/chicken,rice?random=2',
    calories: 620,
    description: 'Tender strips with savory rice and veggies.'
  },
  {
    id: 'c3',
    name: 'Chicken Fried Noodles',
    price: 10.99,
    categoryId: 'chicken',
    imageUrl: 'https://loremflickr.com/600/400/chowmein,chicken?random=3',
    calories: 700,
    description: 'Wok-tossed noodles with grilled chicken chunks.'
  },
  {
    id: 'c4',
    name: 'Spicy Wings (8pc)',
    price: 8.99,
    categoryId: 'chicken',
    imageUrl: 'https://loremflickr.com/600/400/chicken,wings?random=4',
    calories: 550,
  },
  {
    id: 'c5',
    name: 'Chicken Burger Deluxe',
    price: 11.50,
    categoryId: 'chicken',
    imageUrl: 'https://loremflickr.com/600/400/chicken,burger?random=5',
    calories: 900,
  },
  
  // Rice Dishes
  {
    id: 'r1',
    name: 'Spicy Curry Rice',
    price: 11.00,
    categoryId: 'rice-dishes',
    imageUrl: 'https://loremflickr.com/600/400/curry,rice?random=6',
    calories: 600,
  },
  {
    id: 'r2',
    name: 'Teriyaki Bowl',
    price: 12.50,
    categoryId: 'rice-dishes',
    imageUrl: 'https://loremflickr.com/600/400/teriyaki,rice?random=7',
    calories: 580,
  },

  // Snacks
  {
    id: 's1',
    name: 'Mozzarella Sticks',
    price: 5.99,
    categoryId: 'snacks',
    imageUrl: 'https://loremflickr.com/600/400/mozzarella,sticks?random=8',
    calories: 320,
  },
  {
    id: 's2',
    name: 'Onion Rings',
    price: 4.99,
    categoryId: 'snacks',
    imageUrl: 'https://loremflickr.com/600/400/onion,rings?random=9',
    calories: 280,
  },

  // Drinks
  {
    id: 'd1',
    name: 'Cola Large',
    price: 2.99,
    categoryId: 'drinks',
    imageUrl: 'https://loremflickr.com/600/400/cola,soda?random=10',
    calories: 220,
  },
  {
    id: 'd2',
    name: 'Iced Lemon Tea',
    price: 3.50,
    categoryId: 'drinks',
    imageUrl: 'https://loremflickr.com/600/400/iced,tea?random=11',
    calories: 140,
  },
  
  // Sides
  {
    id: 'sd1',
    name: 'French Fries',
    price: 3.99,
    categoryId: 'sides',
    imageUrl: 'https://loremflickr.com/600/400/french,fries?random=12',
    calories: 350,
  },
  {
    id: 'sd2',
    name: 'Coleslaw',
    price: 2.50,
    categoryId: 'sides',
    imageUrl: 'https://loremflickr.com/600/400/coleslaw?random=13',
    calories: 150,
  },
];

export const THEME = {
  primary: '#FF3355', // The requested bright red
  secondary: '#F1F1F1',
  textDark: '#1A1A1A',
  textLight: '#757575',
  bg: '#FFFFFF',
};
