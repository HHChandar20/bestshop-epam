import type { ProductCategory, ProductColor, ProductSize } from './enums.js';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;  // was: string
  color: ProductColor;        // was: string
  size: ProductSize;          // was: string
  salesStatus: boolean;
  rating: number;
  popularity: number;
  blocks: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export type Review = {
  id: string;
  productId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
};