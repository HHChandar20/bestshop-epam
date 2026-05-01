// =========================================================
// api.ts — data fetching, shared across pages
// =========================================================

import type { Product } from '../models/types.js';

const IMAGE_BASE = '../assets/';
const DATA_URL = '../assets/data.json';

export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
    const json = await response.json();
    return (json.data as Product[]).map((p) => ({
        ...p,
        imageUrl: IMAGE_BASE + p.imageUrl,
    }));
}