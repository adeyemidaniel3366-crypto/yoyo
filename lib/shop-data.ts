export interface StoreProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  priceKobo: number;
  originalPriceKobo?: number;
  image: string;
  images?: string[];
  badge?: "NEW" | "SALE" | "HOT" | "BESTSELLER" | "OUT_OF_STOCK";
  inStock: boolean;
  stockCount: number;
  reviewsCount: number;
  rating: number;
  description: string;
  specs?: Record<string, string>;
  features?: string[];
  tag?: string;
}

export const GALAXY_CATEGORIES = [
  "SSDs & Storage",
  "Laptops & Computing",
  "Portable Storage",
  "Audio & Home Theater",
  "Audio & Headphones",
  "Audio & Speakers",
  "Enterprise Storage",
  "Accessories & Power",
  "Monitors & Workspace",
  "Accessories & Peripherals",
] as const;

export type GalaxyCategory = (typeof GALAXY_CATEGORIES)[number];

export const CATALOG_PRODUCTS: StoreProduct[] = [];
