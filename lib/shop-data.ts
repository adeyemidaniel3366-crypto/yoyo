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

export const CATALOG_PRODUCTS: StoreProduct[] = [
  {
    id: "gal_1",
    sku: "SAM-990PRO-4TB",
    slug: "samsung-990-pro-4tb-nvme",
    name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD 7450MB/s",
    brand: "Samsung",
    category: "SSDs & Storage",
    priceKobo: 48000000,
    originalPriceKobo: 54500000,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "BESTSELLER",
    inStock: true,
    stockCount: 8,
    reviewsCount: 38,
    rating: 5,
    tag: "7,450 MB/s Read",
    description:
      "Reach peak gaming and workstation performance with PCIe 4.0. In-house thermal controller delivers supreme power efficiency while maintaining blistering 7,450 MB/s read speeds for PS5 and PC workstations.",
    specs: {
      Capacity: "4TB",
      Interface: "PCIe Gen 4.0 x4, NVMe 2.0",
      "Sequential Read": "Up to 7,450 MB/s",
      "Sequential Write": "Up to 6,900 MB/s",
      FormFactor: "M.2 (2280)",
      Warranty: "5 Years Samsung Manufacturer Warranty",
    },
    features: [
      "Optimized for PS5 and high-end gaming rigs",
      "Nickel-coated controller for thermal throttling defense",
      "Samsung Magician software suite included",
    ],
  },
  {
    id: "gal_2",
    sku: "APPLE-MBP16-M3MAX",
    slug: "apple-macbook-pro-16-m3-max",
    name: "Apple MacBook Pro 16\" M3 Max (36GB Unified Memory, 1TB SSD)",
    brand: "Apple",
    category: "Laptops & Computing",
    priceKobo: 485000000,
    originalPriceKobo: 540000000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "HOT",
    inStock: true,
    stockCount: 4,
    reviewsCount: 19,
    rating: 5,
    tag: "M3 Max · 36GB RAM",
    description:
      "Engineered for pros who push boundaries. Liquid Retina XDR display, hardware-accelerated ray tracing, up to 22 hours battery life, and monstrous M3 Max silicon.",
    specs: {
      Processor: "Apple M3 Max 14-core CPU, 30-core GPU",
      Memory: "36GB Unified Memory",
      Storage: "1TB Ultra-Fast SSD",
      Display: "16.2\" Liquid Retina XDR (3456 x 2234), 120Hz ProMotion",
      Ports: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
      Warranty: "1 Year Official Apple Care Nigeria",
    },
    features: [
      "Up to 22 hours of pro battery life",
      "Extreme Dynamic Range with 1,600 nits peak HDR brightness",
      "Six-speaker sound system with force-cancelling woofers",
    ],
  },
  {
    id: "gal_3",
    sku: "LXR-SL500-2TB",
    slug: "lexar-sl500-portable-ssd-2tb",
    name: "Lexar SL500 Portable SSD 2TB with Magnetic Set (2000MB/s)",
    brand: "Lexar",
    category: "Portable Storage",
    priceKobo: 22000000,
    originalPriceKobo: 26000000,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "SALE",
    inStock: true,
    stockCount: 12,
    reviewsCount: 24,
    rating: 5,
    tag: "2,000 MB/s · Magnetic",
    description:
      "Ultra-slim solid aluminum unibody with blazing USB 3.2 Gen 2x2 performance up to 2000MB/s read and 1800MB/s write speeds. Includes magnetic phone mount kit for ProRes 4K iPhone 15/16 Pro direct video recording.",
    specs: {
      Capacity: "2TB",
      Interface: "USB 3.2 Gen 2x2 Type-C",
      Transfer: "Up to 2,000 MB/s Read, 1,800 MB/s Write",
      Security: "256-bit AES Hardware Encryption",
      Weight: "43 grams Ultra-Lightweight",
      Warranty: "3 Years Lexar Direct Warranty",
    },
    features: [
      "Apple ProRes 4K 60fps direct recording support for iPhone 15/16 Pro",
      "Magnetic silicone mount ring included in box",
      "Cross-platform compatibility (Mac, PC, iOS, Android, PS5)",
    ],
  },
  {
    id: "gal_4",
    sku: "JBL-BAR1300-PRO",
    slug: "jbl-bar-1300-surround-sound",
    name: "JBL Bar 1300 11.1.4 Channel Dolby Atmos Wireless Surround System",
    brand: "JBL",
    category: "Audio & Home Theater",
    priceKobo: 185000000,
    originalPriceKobo: 210000000,
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "NEW",
    inStock: true,
    stockCount: 5,
    reviewsCount: 17,
    rating: 5,
    tag: "1170W · Dolby Atmos",
    description:
      "True 3D theater sound with detachable battery-powered wireless rear speakers and a thunderous 10\" down-firing wireless subwoofer delivering 1170W total system power with MultiBeam surround technology.",
    specs: {
      Power: "1170W Total Peak Output",
      Channels: "11.1.4 with Dolby Atmos & DTS:X 3D",
      Subwoofer: "10-inch Wireless Down-Firing Subwoofer",
      Connectivity: "HDMI eARC, 3x HDMI In, 4K Dolby Vision, Wi-Fi 6, AirPlay 2",
      Warranty: "2 Years Official JBL Warranty",
    },
    features: [
      "Detachable wireless rear surround speakers with built-in battery",
      "PureVoice dialogue enhancement technology",
      "AirPlay, Alexa Multi-Room Music and Chromecast built-in",
    ],
  },
  {
    id: "gal_5",
    sku: "SYN-RS1221RP",
    slug: "synology-8-bay-rackstation-rs1221rp",
    name: "Synology 8 Bay Rackstation RS1221RP+ Redundant Power NAS",
    brand: "Synology",
    category: "Enterprise Storage",
    priceKobo: 245000000,
    originalPriceKobo: 275000000,
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "SALE",
    inStock: true,
    stockCount: 3,
    reviewsCount: 9,
    rating: 5,
    tag: "8-Bay · Redundant PSU",
    description:
      "Enterprise-grade 2U 8-bay rackmount NAS server designed for high-throughput file serving, virtualization, and centralized automated multi-cloud data backups for modern businesses.",
    specs: {
      "Drive Bays": "8 x 3.5\" / 2.5\" SATA (Expandable to 12 bays)",
      Processor: "AMD Ryzen V1500B Quad-Core 2.2 GHz",
      Memory: "4GB DDR4 ECC UDIMM (Expandable to 32GB)",
      Power: "Dual Redundant 350W Power Supplies",
      Warranty: "3 Years Synology Limited Warranty",
    },
    features: [
      "Dual redundant power supplies prevent downtime",
      "Over 2,315 MB/s sequential read throughput",
      "PCIe 3.0 slot for 10GbE networking or M.2 NVMe SSD cache",
    ],
  },
  {
    id: "gal_6",
    sku: "SONY-WH1000XM5",
    slug: "sony-wh-1000xm5-wireless-anc-headphones",
    name: "Sony WH-1000XM5 Premium Wireless Noise-Canceling Headphones",
    brand: "Sony",
    category: "Audio & Headphones",
    priceKobo: 45000000,
    originalPriceKobo: 52000000,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "BESTSELLER",
    inStock: true,
    stockCount: 14,
    reviewsCount: 52,
    rating: 5,
    tag: "Industry-Leading ANC",
    description:
      "Industry-leading active noise canceling with two processors and 8 microphones. Magnificent sound engineered to perfection with High-Resolution Audio Wireless and crystal-clear hands-free calls.",
    specs: {
      Driver: "30mm Precision-engineered Carbon Fiber Driver",
      Battery: "Up to 30 Hours with ANC On (Quick Charge: 3 min = 3 hours)",
      Bluetooth: "Version 5.2 with LDAC, AAC, SBC & Multipoint Connect",
      Weight: "250g Ultra-Comfortable Soft Fit Leather",
      Warranty: "1 Year Official Sony Nigeria Warranty",
    },
    features: [
      "Auto NC Optimizer automatically adjusts cancellation based on environment",
      "Speak-to-Chat automatically pauses playback when you start talking",
      "Multipoint connection pairs seamlessly with laptop and phone simultaneously",
    ],
  },
  {
    id: "gal_7",
    sku: "ANKER-PRIME-27K",
    slug: "anker-prime-27650mah-250w-power-bank",
    name: "Anker Prime 27,650mAh Power Bank (250W 3-Port Smart Display)",
    brand: "Anker",
    category: "Accessories & Power",
    priceKobo: 16500000,
    originalPriceKobo: 19500000,
    image: "https://images.unsplash.com/photo-1609592424160-59a60641eb3a?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1609592424160-59a60641eb3a?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "NEW",
    inStock: true,
    stockCount: 18,
    reviewsCount: 29,
    rating: 5,
    tag: "250W Ultra-Fast · Smart App",
    description:
      "Fast charge two laptops simultaneously at 140W each with monstrous 250W multi-device output. Features real-time smart digital display, Bluetooth companion app, and airplane-approved 99.54Wh capacity.",
    specs: {
      Capacity: "27,650 mAh (99.54Wh Airline Approved)",
      Output: "250W Total Max (Single port 140W USB-C PD 3.1)",
      Ports: "2x USB-C (140W each), 1x USB-A (65W)",
      Recharge: "170W Dual USB-C Ultra-Fast Recharge (0-100% in 37 mins)",
      Warranty: "2 Years Anker Direct Warranty",
    },
    features: [
      "Intelligent LCD shows power, remaining time, and battery health",
      "Anker App connectivity for sound alerts and battery optimization",
      "Charges MacBook Pro 16\" to 50% in just 28 minutes",
    ],
  },
  {
    id: "gal_8",
    sku: "DELL-U3224KB-6K",
    slug: "dell-ultrasharp-32-6k-monitor-u3224kb",
    name: "Dell UltraSharp 32\" 6K UHD IPS Black Monitor (Built-in 4K Webcam)",
    brand: "Dell",
    category: "Monitors & Workspace",
    priceKobo: 295000000,
    originalPriceKobo: 330000000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "HOT",
    inStock: true,
    stockCount: 3,
    reviewsCount: 11,
    rating: 5,
    tag: "6K UHD · IPS Black",
    description:
      "The world's first 6K monitor with IPS Black technology. Delivers 6144 x 3456 resolution (156% more pixels than 4K), 140W Thunderbolt 4 power delivery hub, and built-in dual-gain HDR 4K camera.",
    specs: {
      Resolution: "6K 6144 x 3456 at 60Hz (223 PPI)",
      Panel: "IPS Black (2,000:1 Contrast Ratio)",
      Color: "99% DCI-P3, 100% sRGB, VESA DisplayHDR 600",
      Connectivity: "Thunderbolt 4 (140W PD), HDMI 2.1, Mini-DP 2.1, 2.5GbE LAN",
      Warranty: "3 Years Dell Premium Panel Exchange",
    },
    features: [
      "Built-in 4K Sony Starvis HDR webcam with auto framing and shutter",
      "Integrated dual 14W crystal clear front-facing speakers",
      "KVM switch and Picture-by-Picture to control two PCs simultaneously",
    ],
  },
  {
    id: "gal_9",
    sku: "ZLT-S69M-13360",
    slug: "zealot-s69m-50w-bluetooth-speaker",
    name: "Zealot S69M 50W Portable Bluetooth Speaker with Deep Bass",
    brand: "Zealot",
    category: "Audio & Speakers",
    priceKobo: 12000000,
    originalPriceKobo: 14500000,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "OUT_OF_STOCK",
    inStock: false,
    stockCount: 0,
    reviewsCount: 41,
    rating: 4,
    tag: "50W RMS · IPX7 Water",
    description:
      "50W high-power punchy audio output with dual subwoofers, IPX7 waterproof rating, dynamic RGB party lights, and built-in 8000mAh battery that doubles as an emergency phone charger.",
    specs: {
      "Output Power": "50W RMS Pure Bass",
      Battery: "8,000 mAh (Up to 18 Hours Playtime)",
      Connectivity: "Bluetooth 5.2 / Aux / TF Card / USB Drive",
      Waterproof: "IPX7 Full Submersion Proof",
      Warranty: "1 Year Zealot Nigeria Warranty",
    },
    features: [
      "Dual bass radiators for earth-shaking low frequencies",
      "IPX7 waterproof construction withstands pool and rain parties",
      "TWS wireless pairing to connect two S69M speakers in stereo",
    ],
  },
  {
    id: "gal_10",
    sku: "LOGI-MXM3S-GRAPH",
    slug: "logitech-mx-master-3s-wireless-mouse",
    name: "Logitech MX Master 3S Wireless Performance Mouse (Quiet Clicks)",
    brand: "Logitech",
    category: "Accessories & Peripherals",
    priceKobo: 18500000,
    originalPriceKobo: 21500000,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80",
    ],
    badge: "BESTSELLER",
    inStock: true,
    stockCount: 16,
    reviewsCount: 64,
    rating: 5,
    tag: "8,000 DPI · MagSpeed",
    description:
      "An iconic mouse remastered. Now with Quiet Clicks and 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling delivers 1,000 lines per second in near silence with ultimate ergonomic palm support.",
    specs: {
      Sensor: "Darkfield High Precision (8,000 DPI, Tracks on Glass)",
      Buttons: "7 Custom Programmable Buttons + Thumb Wheel",
      Battery: "Rechargeable Li-Po (500 mAh) - Up to 70 days per charge",
      Connectivity: "Bluetooth Low Energy & Logi Bolt USB Receiver",
      Warranty: "2 Years Logitech Limited Hardware Warranty",
    },
    features: [
      "Quiet Clicks deliver tactile feel with 90% less click noise",
      "MagSpeed scroll wheel scrolls 1,000 lines in 1 second",
      "Seamless cross-computer Flow control between Mac and Windows",
    ],
  },
];
