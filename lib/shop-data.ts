export interface StoreProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  priceKobo: number;
  originalPriceKobo?: number;
  image: string;
  images?: string[];
  badge?: "NEW" | "SALE" | "OUT_OF_STOCK";
  inStock: boolean;
  stockCount: number;
  reviewsCount: number;
  rating: number;
  description: string;
  specs?: Record<string, string>;
}

export const CATALOG_PRODUCTS: StoreProduct[] = [
  {
    id: "gal_1",
    sku: "SAM-990PRO-4TB",
    slug: "samsung-990-pro-4tb-nvme",
    name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD 7450MB/s",
    category: "SSDs & Storage",
    priceKobo: 48000000,
    originalPriceKobo: 53760000,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "SALE",
    inStock: true,
    stockCount: 8,
    reviewsCount: 14,
    rating: 5,
    description:
      "Reach near-max performance with PCIe 4.0. The in-house controller's smart heat control delivers supreme power efficiency while maintaining ferocious speed.",
    specs: {
      Capacity: "4TB",
      Interface: "PCIe Gen 4.0 x4, NVMe 2.0",
      "Sequential Read": "Up to 7,450 MB/s",
      "Sequential Write": "Up to 6,900 MB/s",
      Warranty: "5 Years Manufacturer Warranty",
    },
  },
  {
    id: "gal_2",
    sku: "APPLE-MBP16-M3MAX",
    slug: "apple-macbook-pro-16-m3-max",
    name: "Apple MacBook Pro 16\" M3 Max (36GB Unified Memory, 1TB SSD)",
    category: "Laptops & Computing",
    priceKobo: 485000000,
    originalPriceKobo: 543200000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "NEW",
    inStock: true,
    stockCount: 4,
    reviewsCount: 8,
    rating: 5,
    description:
      "Engineered for pros who push boundaries. Liquid Retina XDR display, pro ports, all-day battery life, and monstrous M3 Max silicon.",
    specs: {
      Processor: "Apple M3 Max 14-core CPU, 30-core GPU",
      Memory: "36GB Unified Memory",
      Storage: "1TB Ultra-Fast SSD",
      Display: '16.2" Liquid Retina XDR (3456 x 2234)',
      Warranty: "1 Year Official Apple Care",
    },
  },
  {
    id: "gal_3",
    sku: "ZLT-S69M-13360",
    slug: "zealot-s69m-50w-bluetooth-speaker",
    name: "Zealot S69M 50W Portable Bluetooth Speaker with Deep Bass",
    category: "Audio & Speakers",
    priceKobo: 12000000,
    originalPriceKobo: 13440000,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "OUT_OF_STOCK",
    inStock: false,
    stockCount: 0,
    reviewsCount: 22,
    rating: 4,
    description:
      "50W high-power output with dual subwoofers, IPX7 waterproof rating, RGB pulse light show, and built-in 8000mAh battery/powerbank.",
    specs: {
      "Output Power": "50W RMS",
      Battery: "8,000 mAh (Up to 18 Hours Playtime)",
      Connectivity: "Bluetooth 5.2 / Aux / TF Card",
      Waterproof: "IPX7 Full Submersion Proof",
    },
  },
  {
    id: "gal_4",
    sku: "LXR-SL500-2TB",
    slug: "lexar-sl500-portable-ssd-2tb",
    name: "Lexar SL500 Portable SSD 2TB with Magnetic Set 2000MB/s",
    category: "Portable SSD",
    priceKobo: 22000000,
    originalPriceKobo: 24640000,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "NEW",
    inStock: true,
    stockCount: 12,
    reviewsCount: 6,
    rating: 5,
    description:
      "Slim, durable aluminum casing with blazing-fast USB 3.2 Gen 2x2 performance up to 2000MB/s read and 1800MB/s write speeds.",
    specs: {
      Capacity: "2TB",
      Interface: "USB 3.2 Gen 2x2 Type-C",
      Transfer: "Up to 2,000 MB/s",
      Security: "256-bit AES Hardware Encryption",
      Warranty: "3 Years Lexar Direct Warranty",
    },
  },
  {
    id: "gal_5",
    sku: "SYN-RS1221RP",
    slug: "synology-8-bay-rackstation-rs1221rp",
    name: "Synology 8 Bay Rackstation RS1221RP+ Redundant Power NAS",
    category: "NAS & Servers",
    priceKobo: 245000000,
    originalPriceKobo: 274400000,
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "SALE",
    inStock: true,
    stockCount: 3,
    reviewsCount: 5,
    rating: 5,
    description:
      "Enterprise-grade 2U 8-bay rackmount NAS server designed for high-throughput file serving, virtualization, and central enterprise backups.",
    specs: {
      "Drive Bays": "8 x 3.5\" / 2.5\" SATA (Expandable to 12 bays)",
      Processor: "AMD Ryzen V1500B Quad-Core 2.2 GHz",
      Memory: "4GB DDR4 ECC UDIMM (Expandable to 32GB)",
      Power: "Dual Redundant 350W Power Supplies",
      Warranty: "3 Years Synology Limited Warranty",
    },
  },
  {
    id: "gal_6",
    sku: "JBL-BAR1300-PRO",
    slug: "jbl-bar-1300-surround-sound",
    name: "JBL Bar 1300 11.1.4 Channel Dolby Atmos Wireless Surround System",
    category: "Audio & Home Theater",
    priceKobo: 185000000,
    originalPriceKobo: 207200000,
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    ],
    badge: "NEW",
    inStock: true,
    stockCount: 5,
    reviewsCount: 11,
    rating: 5,
    description:
      "True 3D surround sound with detachable battery-powered wireless rear speakers and massive 10\" wireless subwoofer delivering 1170W total power.",
    specs: {
      Power: "1170W Total Peak Output",
      Channels: "11.1.4 with Dolby Atmos & DTS:X",
      Subwoofer: "10-inch Wireless Down-Firing Sub",
      Connectivity: "HDMI eARC, 4K Dolby Vision Pass-through, Wi-Fi 6",
    },
  },
];
