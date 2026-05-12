import type { Product, Review } from '../models/types.js';

const IMAGE_BASE = '../../src/assets/';
const PRODUCTS_URL = '../../src/assets/data/data.json';
const REVIEWS_URL = '../../src/assets/data/reviews.json';

export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(PRODUCTS_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const json = await response.json();

    return (json.data as Product[]).map((p) => ({
        ...p,
        imageUrl: IMAGE_BASE + p.imageUrl,
    }));
}

export async function fetchReviews(): Promise<Review[]> {
    const response = await fetch(REVIEWS_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
    }

    const json = await response.json();

    return json.reviews as Review[];
}