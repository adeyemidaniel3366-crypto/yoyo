"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceSlug } from "./constants";
import { formatCurrency } from "./money";
import {
  deleteProductFromBackend,
  syncProductToBackend,
  syncTransactionToBackend,
} from "./api-sync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnifiedProduct {
  id: string;
  source: ServiceSlug;
  sku: string;
  name: string;
  label: string;
  description: string;
  priceKobo: number;
  costKobo?: number;
  priceDisplay: string;
  imageUrl: string;
  images: string[];
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "PROMO" | "INACTIVE" | "ARCHIVED";
  totalStock: number;
  lowStockAt: number;
  isFeatured?: boolean;
  isNew?: boolean;
  capacity?: string;
  amenities?: string[];
  createdAt?: string;
}

export interface UnifiedVisitorLog {
  id: string;
  badgeNo: string;
  name: string;
  phone: string;
  email?: string;
  hostEmployee: string;
  purpose: string;
  visitDate: string;
  visitTime: string;
  appointmentDate?: string;
  appointmentTime?: string;
  checkIn: string;
  checkOut: string | null;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

export interface UnifiedInvoiceActivity {
  id: string;
  source: ServiceSlug;
  activityType: "SALE" | "BOOKING" | "ORDER" | "INVOICE" | "EXPENSE" | "VISIT" | "PAYMENT";
  activitySummary: string;
  invoiceNo: string;
  customer: string;
  amountKobo: number;
  amountDisplay: string;
  status: string;
  location: string;
  createdAt: string;
}

export interface UnifiedActivityLogItem {
  id: string;
  source: ServiceSlug;
  time: string;
  actor: string;
  action: string;
  amount: string | null;
  location: string | null;
}

export interface UnifiedPaymentDue {
  id: string;
  type: "SALES" | "PURCHASE";
  source: ServiceSlug;
  partyName: string;
  referenceNo: string;
  dueAmountKobo: number;
}

export interface UnifiedCartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceKobo: number;
  qty: number;
  image: string;
}

export interface UnifiedPaymentSettings {
  paystack: {
    enabled: boolean;
    publishKey: string;
    secretKey: string;
  };
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
  };
  stripe: {
    enabled: boolean;
    publishKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    merchantAccount: string;
  };
}

export interface UnifiedMonthlyTargets {
  salesTargetKobo: number;
  expenseBudgetKobo: number;
  bookingsTarget: number;
  visitorsTarget: number;
}

// ---------------------------------------------------------------------------
// Default Seed Data Across All 6 Unified Services
// ---------------------------------------------------------------------------

export const DEFAULT_UNIFIED_PRODUCTS: UnifiedProduct[] = [
  {
    id: "p_spark_1",
    source: ServiceSlug.SPARK,
    sku: "SAM-990PRO-4TB",
    name: "Samsung 990 PRO 4TB NVMe SSD",
    label: "Best Seller",
    description: "PCIe 4.0 NVMe M.2 Internal SSD with Heatsink — 7,450 MB/s Read Speed",
    priceKobo: 48000000,
    costKobo: 38000000,
    priceDisplay: "₦480,000",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80"],
    status: "LOW_STOCK",
    totalStock: 2,
    lowStockAt: 5,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_spark_2",
    source: ServiceSlug.SPARK,
    sku: "APPLE-MBP16-M3MAX",
    name: "Apple MacBook Pro 16\" M3 Max",
    label: "Flagship POS",
    description: "Apple M3 Max chip, 36GB Unified Memory, 1TB SSD Storage — Space Black",
    priceKobo: 485000000,
    costKobo: 420000000,
    priceDisplay: "₦4,850,000",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 6,
    lowStockAt: 3,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "p_spark_3",
    source: ServiceSlug.SPARK,
    sku: "ZLT-S69M-13360",
    name: "Zealot S69M 50W Portable Bluetooth Speaker",
    label: "Computer Village Fast Mover",
    description: "Deep Bass Waterproof Wireless Speaker with Dual Pairing & Powerbank",
    priceKobo: 12000000,
    costKobo: 8500000,
    priceDisplay: "₦120,000",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80"],
    status: "OUT_OF_STOCK",
    totalStock: 0,
    lowStockAt: 5,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "p_galaxy_1",
    source: ServiceSlug.GALAXY,
    sku: "LXR-SL500-2TB",
    name: "Lexar SL500 Portable SSD 2TB",
    label: "Portable Storage",
    description: "Ultra-Slim Aluminum USB 3.2 Gen 2x2 Portable External SSD — 2000MB/s",
    priceKobo: 22000000,
    costKobo: 17000000,
    priceDisplay: "₦220,000",
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 12,
    lowStockAt: 5,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "p_galaxy_2",
    source: ServiceSlug.GALAXY,
    sku: "SYN-RS1221RP",
    name: "Synology 8 Bay Rackstation RS1221RP+",
    label: "Enterprise Storage",
    description: "2U Rackmount NAS Server with Redundant Power & AMD Ryzen V1500B",
    priceKobo: 245000000,
    costKobo: 200000000,
    priceDisplay: "₦2,450,000",
    imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 4,
    lowStockAt: 2,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_galaxy_3",
    source: ServiceSlug.GALAXY,
    sku: "SAM-990PRO-4TB",
    name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD",
    label: "SSDs & Storage",
    description: "High performance NVMe SSD with smart heatsink and 7450MB/s read speeds",
    priceKobo: 48000000,
    costKobo: 39000000,
    priceDisplay: "₦480,000",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 8,
    lowStockAt: 3,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_galaxy_4",
    source: ServiceSlug.GALAXY,
    sku: "APPLE-MBP16-M3MAX",
    name: "Apple MacBook Pro 16\" M3 Max (36GB / 1TB SSD)",
    label: "Laptops & Computing",
    description: "Pro performance laptop with Liquid Retina XDR display and M3 Max silicon",
    priceKobo: 485000000,
    costKobo: 420000000,
    priceDisplay: "₦4,850,000",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 4,
    lowStockAt: 2,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "p_galaxy_5",
    source: ServiceSlug.GALAXY,
    sku: "JBL-BAR1300-PRO",
    name: "JBL Bar 1300 11.1.4 Dolby Atmos Surround System",
    label: "Audio & Home Theater",
    description: "1170W wireless surround system with detachable rear speakers & 10\" sub",
    priceKobo: 185000000,
    costKobo: 155000000,
    priceDisplay: "₦1,850,000",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 5,
    lowStockAt: 2,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "p_galaxy_6",
    source: ServiceSlug.GALAXY,
    sku: "SONY-WH1000XM5",
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    label: "Audio & Headphones",
    description: "Industry-leading noise cancelling headphones with 30-hour battery life",
    priceKobo: 45000000,
    costKobo: 37000000,
    priceDisplay: "₦450,000",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 14,
    lowStockAt: 4,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_galaxy_7",
    source: ServiceSlug.GALAXY,
    sku: "ANKER-PRIME-27K",
    name: "Anker Prime 27,650mAh Power Bank (250W)",
    label: "Accessories & Power",
    description: "250W 3-port ultra-fast power bank with smart LCD digital display",
    priceKobo: 16500000,
    costKobo: 13000000,
    priceDisplay: "₦165,000",
    imageUrl: "https://images.unsplash.com/photo-1609592424160-59a60641eb3a?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1609592424160-59a60641eb3a?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 18,
    lowStockAt: 5,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "p_galaxy_8",
    source: ServiceSlug.GALAXY,
    sku: "DELL-U3224KB-6K",
    name: "Dell UltraSharp 32\" 6K UHD IPS Black Monitor",
    label: "Monitors & Workspace",
    description: "6K resolution monitor with IPS Black, 4K webcam and 140W Thunderbolt 4 hub",
    priceKobo: 295000000,
    costKobo: 250000000,
    priceDisplay: "₦2,950,000",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80"],
    status: "LOW_STOCK",
    totalStock: 3,
    lowStockAt: 2,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "p_galaxy_9",
    source: ServiceSlug.GALAXY,
    sku: "ZLT-S69M-13360",
    name: "Zealot S69M 50W Outdoor Bluetooth Speaker",
    label: "Audio & Speakers",
    description: "50W waterproof IPX7 party speaker with dual bass drivers",
    priceKobo: 12000000,
    costKobo: 9500000,
    priceDisplay: "₦120,000",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop&q=80"],
    status: "OUT_OF_STOCK",
    totalStock: 0,
    lowStockAt: 5,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "p_galaxy_10",
    source: ServiceSlug.GALAXY,
    sku: "LOGI-MXM3S-GRAPH",
    name: "Logitech MX Master 3S Wireless Mouse",
    label: "Accessories & Peripherals",
    description: "Ergonomic 8000 DPI quiet click wireless mouse with MagSpeed scrolling",
    priceKobo: 18500000,
    costKobo: 14500000,
    priceDisplay: "₦185,000",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 16,
    lowStockAt: 5,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_builders_1",
    source: ServiceSlug.BUILDERS,
    sku: "DAN-CEM-50KG",
    name: "Dangote 3X Cement 50kg Bag",
    label: "Wholesale Yard Supply",
    description: "42.5R High Strength Portland Limestone Cement for Structural Concrete",
    priceKobo: 980000,
    costKobo: 820000,
    priceDisplay: "₦9,800",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 240,
    lowStockAt: 50,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "p_builders_2",
    source: ServiceSlug.BUILDERS,
    sku: "IRON-ROD-16MM",
    name: "TMT High-Tensile Iron Rod 16mm (Length)",
    label: "Structural Steel",
    description: "BS4449 Grade 500B Thermo-Mechanically Treated Reinforcement Bar",
    priceKobo: 1800000,
    costKobo: 1400000,
    priceDisplay: "₦18,000",
    imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80"],
    status: "LOW_STOCK",
    totalStock: 2,
    lowStockAt: 10,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "p_builders_3",
    source: ServiceSlug.BUILDERS,
    sku: "BUA-CEM-50KG",
    name: "BUA Sokoto Cement 50kg Bag",
    label: "Construction Essential",
    description: "Fast-Setting Multi-Purpose Construction Cement — Yard Batch ST-00021",
    priceKobo: 950000,
    costKobo: 790000,
    priceDisplay: "₦9,500",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=600&auto=format&fit=crop&q=80"],
    status: "OUT_OF_STOCK",
    totalStock: 0,
    lowStockAt: 20,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "p_apt_1",
    source: ServiceSlug.APARTMENTS,
    sku: "APT-CLASSIC-STUDIO",
    name: "Classic Studio Apartment",
    label: "Cozy Lekki Stay",
    description: "24/7 Power, High-Speed Fiber Wi-Fi, Air Conditioning & Water Heater",
    priceKobo: 1000000,
    costKobo: 300000,
    priceDisplay: "₦10,000 / night",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 4,
    lowStockAt: 1,
    isFeatured: true,
    capacity: "1 Adult",
    amenities: ["AC", "Heater", "WiFi"],
  },
  {
    id: "p_apt_2",
    source: ServiceSlug.APARTMENTS,
    sku: "APT-DELUXE-STUDIO",
    name: "Deluxe Studio Suite",
    label: "Most Popular Suite",
    description: "Fitted Kitchenette, Smart 55\" 4K TV, King Bed & 24/7 Concierge",
    priceKobo: 3000000,
    costKobo: 800000,
    priceDisplay: "₦30,000 / night",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 4,
    lowStockAt: 1,
    isFeatured: true,
    capacity: "2 Adults",
    amenities: ["AC", "Kitchen", "Smart TV"],
  },
  {
    id: "p_apt_3",
    source: ServiceSlug.APARTMENTS,
    sku: "APT-LUXURY-2BR",
    name: "Luxury 2-Bedroom Executive Apartment",
    label: "VIP Hospitality",
    description: "Private Balcony Sitout, Full Chef Kitchen, 2 En-Suite Rooms & Lounge",
    priceKobo: 5000000,
    costKobo: 1200000,
    priceDisplay: "₦50,000 / night",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 4,
    lowStockAt: 1,
    isFeatured: true,
    capacity: "4 Adults",
    amenities: ["Sitout", "AC", "Kitchen", "Bath Heater"],
  },
  {
    id: "p_bill_1",
    source: ServiceSlug.BILLSTACKS,
    sku: "BILL-STANDARD-PLAN",
    name: "Billstacks Standard Business Plan",
    label: "SaaS Subscription",
    description: "Unlimited Invoices, Automated Expense Tracking, Tax Reports & 5 Users",
    priceKobo: 200000,
    costKobo: 20000,
    priceDisplay: "₦2,000 / month",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 999,
    lowStockAt: 0,
    isFeatured: true,
  },
  {
    id: "p_vis_1",
    source: ServiceSlug.VISITORS,
    sku: "VIS-KIOSK-ENTERPRISE",
    name: "Enterprise Kiosk & Digital Badge Pass",
    label: "Front Desk Security",
    description: "QR Pre-Registration, Instant Visitor Pass Printing & Staff Clock-In",
    priceKobo: 0,
    costKobo: 0,
    priceDisplay: "Included",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"],
    status: "ACTIVE",
    totalStock: 999,
    lowStockAt: 0,
    isFeatured: false,
  },
];

export const DEFAULT_UNIFIED_INVOICES: UnifiedInvoiceActivity[] = [
  {
    id: "inv_1",
    source: ServiceSlug.SPARK,
    activityType: "SALE",
    activitySummary: "POS Retail Sale — 2× Samsung 990 PRO 4TB NVMe",
    invoiceNo: "SPK-9044",
    customer: "Vertex Systems Ltd",
    amountKobo: 120000000,
    amountDisplay: "₦1,200,000",
    status: "PAID",
    location: "Medical Road",
    createdAt: "2026-11-20",
  },
  {
    id: "inv_2",
    source: ServiceSlug.APARTMENTS,
    activityType: "BOOKING",
    activitySummary: "3-Night Reservation — Deluxe Studio Suite (Incl. 10% Tax)",
    invoiceNo: "ZINO-482091",
    customer: "Adaeze Okafor",
    amountKobo: 9900000,
    amountDisplay: "₦99,000",
    status: "CONFIRMED",
    location: "Zino Apartments Main",
    createdAt: "2026-11-20",
  },
  {
    id: "inv_3",
    source: ServiceSlug.BUILDERS,
    activityType: "SALE",
    activitySummary: "Credit Yard Dispatch — 40 Bags Dangote Cement & Iron Rods",
    invoiceNo: "INV-000104",
    customer: "Mama Bose Ventures",
    amountKobo: 28130000,
    amountDisplay: "₦281,300",
    status: "UNPAID",
    location: "Builders Yard",
    createdAt: "2026-11-19",
  },
  {
    id: "inv_4",
    source: ServiceSlug.GALAXY,
    activityType: "ORDER",
    activitySummary: "Online Storefront Checkout — Lexar SL500 2TB + Accessories",
    invoiceNo: "DG-892104",
    customer: "Chinedu Eze (Online)",
    amountKobo: 24500000,
    amountDisplay: "₦245,000",
    status: "SHIPPED",
    location: "Galaxy Online",
    createdAt: "2026-11-19",
  },
  {
    id: "inv_5",
    source: ServiceSlug.BILLSTACKS,
    activityType: "INVOICE",
    activitySummary: "SaaS B2B Retainer Invoice — Enterprise Accounting Suite",
    invoiceNo: "INV-000084",
    customer: "Prime Technologies PLC",
    amountKobo: 145000000,
    amountDisplay: "₦1,450,000",
    status: "PAID",
    location: "Billstacks Cloud",
    createdAt: "2026-11-18",
  },
  {
    id: "inv_6",
    source: ServiceSlug.VISITORS,
    activityType: "VISIT",
    activitySummary: "Front Desk Kiosk Check-In & Security Pass Issued",
    invoiceNo: "VIS-00041",
    customer: "Engr. Tunde Bakare",
    amountKobo: 0,
    amountDisplay: "Pass #041",
    status: "CHECKED_IN",
    location: "HQ Reception Desk",
    createdAt: "2026-11-20",
  },
  {
    id: "inv_7",
    source: ServiceSlug.SPARK,
    activityType: "SALE",
    activitySummary: "Walk-in POS Sale — 2× Samsung 990 PRO 4TB SSD",
    invoiceNo: "SPK-9039",
    customer: "Walk-in Customer",
    amountKobo: 96000000,
    amountDisplay: "₦960,000",
    status: "PAID",
    location: "Adepele Shop",
    createdAt: "2026-11-19",
  },
  {
    id: "inv_8",
    source: ServiceSlug.BUILDERS,
    activityType: "SALE",
    activitySummary: "Part-Paid Yard Supply — 20 Lengths 16mm Iron Rod",
    invoiceNo: "INV-000105",
    customer: "Chief Okonkwo Builders",
    amountKobo: 19500000,
    amountDisplay: "₦195,000",
    status: "PART_PAID",
    location: "Builders Yard",
    createdAt: "2026-11-18",
  },
  {
    id: "inv_9",
    source: ServiceSlug.APARTMENTS,
    activityType: "BOOKING",
    activitySummary: "Guest Checked-In — Luxury 2-Bedroom Executive Suite",
    invoiceNo: "ZINO-482100",
    customer: "Mr. Femi Adeleke",
    amountKobo: 18000000,
    amountDisplay: "₦180,000",
    status: "CHECKED_IN",
    location: "Zino Apartments Main",
    createdAt: "2026-11-17",
  },
  {
    id: "inv_10",
    source: ServiceSlug.GALAXY,
    activityType: "ORDER",
    activitySummary: "E-Commerce Delivery Completed — MacBook Pro 16\" M3 Max",
    invoiceNo: "DG-892201",
    customer: "TechHub Lagos",
    amountKobo: 485000000,
    amountDisplay: "₦4,850,000",
    status: "DELIVERED",
    location: "Galaxy Online",
    createdAt: "2026-11-16",
  },
  {
    id: "inv_11",
    source: ServiceSlug.SPARK,
    activityType: "EXPENSE",
    activitySummary: "Diesel Generator & Power Maintenance — Computer Village",
    invoiceNo: "EXP-2026-19",
    customer: "Oando Energy Supply",
    amountKobo: 8500000,
    amountDisplay: "₦85,000",
    status: "PAID",
    location: "Olayeni Office",
    createdAt: "2026-11-18",
  },
];

export const DEFAULT_UNIFIED_ACTIVITIES: UnifiedActivityLogItem[] = [
  {
    id: "act_1",
    source: ServiceSlug.SPARK,
    time: "Just now",
    actor: "Cashier (Medical Road)",
    action: "sold 2 × Samsung 990 PRO 4TB (SPK-9044)",
    amount: "₦1,200,000",
    location: "Medical Road",
  },
  {
    id: "act_2",
    source: ServiceSlug.APARTMENTS,
    time: "12 min ago",
    actor: "Reception Desk",
    action: "checked in Adaeze Okafor — Deluxe Studio Suite",
    amount: "₦99,000",
    location: "Zino Main",
  },
  {
    id: "act_3",
    source: ServiceSlug.BUILDERS,
    time: "28 min ago",
    actor: "Yard Supervisor",
    action: "dispatched 40 bags Dangote Cement to Mama Bose Ventures",
    amount: "₦281,300",
    location: "Builders Yard",
  },
  {
    id: "act_4",
    source: ServiceSlug.GALAXY,
    time: "45 min ago",
    actor: "Online Customer",
    action: "placed Order #DG-892104 (Lexar SL500 SSD + Hub)",
    amount: "₦245,000",
    location: "Galaxy Online",
  },
  {
    id: "act_5",
    source: ServiceSlug.VISITORS,
    time: "1 hr ago",
    actor: "Self Check-In Kiosk",
    action: "issued visitor badge #VIS-00041 to Engr. Tunde Bakare",
    amount: null,
    location: "HQ Office",
  },
  {
    id: "act_6",
    source: ServiceSlug.BILLSTACKS,
    time: "2 hrs ago",
    actor: "Accountant",
    action: "collected Invoice #INV-000084 from Prime Technologies",
    amount: "₦1,450,000",
    location: "Billstacks Cloud",
  },
];

export const DEFAULT_PAYMENT_DUES: UnifiedPaymentDue[] = [
  {
    id: "spd_1",
    type: "SALES",
    source: ServiceSlug.BUILDERS,
    partyName: "Mama Bose Ventures",
    referenceNo: "INV-000104",
    dueAmountKobo: 28130000,
  },
  {
    id: "spd_2",
    type: "SALES",
    source: ServiceSlug.BUILDERS,
    partyName: "Chief Okonkwo Builders",
    referenceNo: "INV-000105",
    dueAmountKobo: 19500000,
  },
  {
    id: "spd_3",
    type: "SALES",
    source: ServiceSlug.SPARK,
    partyName: "Vertex Systems Ltd",
    referenceNo: "SPK-9042",
    dueAmountKobo: 35820000,
  },
  {
    id: "ppd_1",
    type: "PURCHASE",
    source: ServiceSlug.SPARK,
    partyName: "SanDisk Official West Africa",
    referenceNo: "PO-2026-881",
    dueAmountKobo: 32000000,
  },
];

export const DEFAULT_MONTHLY_TARGETS: UnifiedMonthlyTargets = {
  salesTargetKobo: 5000000000, // ₦50,000,000
  expenseBudgetKobo: 600000000, // ₦6,000,000
  bookingsTarget: 15,
  visitorsTarget: 20,
};

export const DEFAULT_CART_ITEMS: UnifiedCartItem[] = [
  {
    id: "cart_item_1",
    productId: "p_spark_1",
    name: "Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD",
    sku: "SAM-990PRO-4TB",
    priceKobo: 48000000,
    qty: 1,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400",
  },
  {
    id: "cart_item_2",
    productId: "p_galaxy_1",
    name: "Lexar SL500 Portable SSD 2TB",
    sku: "LXR-SL500-2TB",
    priceKobo: 22000000,
    qty: 1,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
  },
];

export const DEFAULT_VISITORS: UnifiedVisitorLog[] = [
  {
    id: "v1",
    badgeNo: "VIS-00041",
    name: "Engr. Tunde Bakare",
    phone: "+234 802 987 6543",
    email: "tunde.b@cloudsystems.ng",
    hostEmployee: "Mr. Femi Adeleke (Finance)",
    purpose: "Cloud Infrastructure Audit",
    visitDate: "2026-11-21",
    visitTime: "09:15",
    appointmentDate: "2026-11-21",
    appointmentTime: "09:00",
    checkIn: "2026-11-21, 09:15 AM",
    checkOut: null,
    status: "CHECKED_IN",
  },
  {
    id: "v2",
    badgeNo: "VIS-00040",
    name: "Amaka Nwachukwu",
    phone: "+234 803 111 2233",
    email: "amaka@zenithpartners.com",
    hostEmployee: "Chief Executive Office",
    purpose: "Partnership Discussion",
    visitDate: "2026-11-21",
    visitTime: "10:30",
    appointmentDate: "2026-11-21",
    appointmentTime: "10:30",
    checkIn: "2026-11-21, 10:30 AM",
    checkOut: null,
    status: "CHECKED_IN",
  },
  {
    id: "v3",
    badgeNo: "VIS-00039",
    name: "Chinedu Okeke",
    phone: "+234 809 333 4455",
    hostEmployee: "Storekeeper (Adepele)",
    purpose: "Equipment Delivery",
    visitDate: "2026-11-20",
    visitTime: "14:00",
    appointmentDate: "2026-11-20",
    appointmentTime: "14:00",
    checkIn: "2026-11-20, 14:00",
    checkOut: "14:45",
    status: "CHECKED_OUT",
  },
];

export const DEFAULT_ROOM_STATUSES: Record<string, "AVAILABLE" | "OCCUPIED" | "CLEANING"> = {
  p_apt_1: "AVAILABLE",
  p_apt_2: "OCCUPIED",
  p_apt_3: "AVAILABLE",
  suite_101: "OCCUPIED",
  suite_102: "AVAILABLE",
  suite_201: "AVAILABLE",
  suite_301: "OCCUPIED",
};

export const DEFAULT_PAYMENT_SETTINGS: UnifiedPaymentSettings = {
  paystack: {
    enabled: true,
    publishKey: "pk_test_9291b248a34d88e0b234199c",
    secretKey: "sk_test_••••••••••••••••••••••••",
  },
  razorpay: {
    enabled: false,
    keyId: "",
    keySecret: "",
  },
  stripe: {
    enabled: true,
    publishKey: "pk_live_51P8892Zbcd112A90",
    secretKey: "sk_live_••••••••••••••••••••••••",
  },
  paypal: {
    enabled: true,
    merchantAccount: "billing@zinoone.com",
  },
};

// ---------------------------------------------------------------------------
// Storage Keys & Event Sync
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  PRODUCTS: "zino_unified_catalog_v3",
  DELETED_PRODUCTS: "zino_deleted_product_ids_v1",
  INVOICES: "zino_unified_invoices_v2",
  ACTIVITIES: "zino_unified_activities_v2",
  DUES: "zino_unified_dues_v2",
  TARGETS: "zino_unified_targets_v2",
  CART: "zino_unified_cart_v2",
  VISITORS: "zino_unified_visitors_v2",
  ROOM_STATUSES: "zino_unified_room_statuses_v2",
  GLOBAL_SERVICE_FILTER: "zino_global_service_filter_v2",
  GLOBAL_LOCATION_FILTER: "zino_global_location_filter_v2",
  PAYMENT_SETTINGS: "zino_payment_settings_v1",
};

const STORE_EVENT = "zino-platform-store-sync";

export function readProductsStorage(): UnifiedProduct[] {
  if (typeof window === "undefined") return DEFAULT_UNIFIED_PRODUCTS;
  try {
    const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
    const deletedSet = new Set(deletedList.map((d) => String(d).toLowerCase()));

    let raw = window.localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    // If v3 doesn't exist yet, inspect legacy v2 to carry over custom products while ensuring all defaults exist
    if (!raw) {
      const v2Raw = window.localStorage.getItem("zino_unified_catalog_v2");
      let baseList = DEFAULT_UNIFIED_PRODUCTS;
      if (v2Raw) {
        try {
          const v2List = JSON.parse(v2Raw) as UnifiedProduct[];
          if (Array.isArray(v2List) && v2List.length > 0) {
            const existingIds = new Set(v2List.map((p) => p.id));
            const existingSkus = new Set(v2List.map((p) => p.sku.toLowerCase()));
            const missing = DEFAULT_UNIFIED_PRODUCTS.filter(
              (dp) =>
                !existingIds.has(dp.id) &&
                !existingSkus.has(dp.sku.toLowerCase()) &&
                !deletedSet.has(dp.id.toLowerCase()) &&
                !deletedSet.has(dp.sku.toLowerCase())
            );
            baseList = [...v2List, ...missing];
          }
        } catch {}
      }
      baseList = baseList.filter(
        (p) => !deletedSet.has(p.id.toLowerCase()) && !deletedSet.has(p.sku.toLowerCase())
      );
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(baseList));
      return baseList;
    }

    const parsed = JSON.parse(raw) as UnifiedProduct[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const filteredDefaults = DEFAULT_UNIFIED_PRODUCTS.filter(
        (dp) => !deletedSet.has(dp.id.toLowerCase()) && !deletedSet.has(dp.sku.toLowerCase())
      );
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredDefaults));
      return filteredDefaults;
    }

    // Filter parsed list against deleted set to ensure deleted demo products never reappear
    const cleanedParsed = parsed.filter(
      (p) => !deletedSet.has(p.id.toLowerCase()) && !deletedSet.has(p.sku.toLowerCase())
    );

    // Only inject missing defaults if they are NOT in deletedSet
    const existingIds = new Set(cleanedParsed.map((p) => p.id));
    const existingSkus = new Set(cleanedParsed.map((p) => p.sku.toLowerCase()));
    const missing = DEFAULT_UNIFIED_PRODUCTS.filter(
      (dp) =>
        !existingIds.has(dp.id) &&
        !existingSkus.has(dp.sku.toLowerCase()) &&
        !deletedSet.has(dp.id.toLowerCase()) &&
        !deletedSet.has(dp.sku.toLowerCase())
    );

    if (missing.length > 0 || cleanedParsed.length !== parsed.length) {
      const merged = [...cleanedParsed, ...missing];
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
      return merged;
    }

    return cleanedParsed;
  } catch {
    return DEFAULT_UNIFIED_PRODUCTS;
  }
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { key } }));
  } catch {
    // Quota or SSR
  }
}

// ---------------------------------------------------------------------------
// Direct Imperative Helpers (callable from any page or handler)
// ---------------------------------------------------------------------------

export function recordPlatformTransaction(params: {
  source: ServiceSlug;
  activityType: UnifiedInvoiceActivity["activityType"];
  activitySummary: string;
  invoiceNo?: string;
  customer: string;
  amountKobo: number;
  status?: string;
  location?: string;
  actor?: string;
  createdAt?: string;
}) {
  const prefixMap: Record<ServiceSlug, string> = {
    [ServiceSlug.SPARK]: "SPK",
    [ServiceSlug.BUILDERS]: "INV",
    [ServiceSlug.APARTMENTS]: "ZINO",
    [ServiceSlug.GALAXY]: "DG",
    [ServiceSlug.BILLSTACKS]: "INV",
    [ServiceSlug.VISITORS]: "VIS",
  };
  const invoiceNo =
    params.invoiceNo ||
    `${prefixMap[params.source]}-${Math.floor(100000 + Math.random() * 900000)}`;
  const amountDisplay =
    params.amountKobo > 0 ? formatCurrency(params.amountKobo) : "Pass Issued";
  const txDate = params.createdAt || new Date().toISOString().slice(0, 10);

  const newInvoice: UnifiedInvoiceActivity = {
    id: `inv_${Date.now()}`,
    source: params.source,
    activityType: params.activityType,
    activitySummary: params.activitySummary,
    invoiceNo,
    customer: params.customer,
    amountKobo: params.amountKobo,
    amountDisplay,
    status: params.status || "PAID",
    location: params.location || "Main Location",
    createdAt: txDate,
  };

  const currentInvoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
  writeStorage(STORAGE_KEYS.INVOICES, [newInvoice, ...currentInvoices]);

  const newActivity: UnifiedActivityLogItem = {
    id: `act_${Date.now()}`,
    source: params.source,
    time: params.createdAt ? params.createdAt : "Just now",
    actor: params.actor || params.customer,
    action: `${params.activitySummary} (${invoiceNo})`,
    amount: params.amountKobo > 0 ? amountDisplay : null,
    location: params.location || "Main Location",
  };

  const currentActivities = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
  writeStorage(STORAGE_KEYS.ACTIVITIES, [newActivity, ...currentActivities.slice(0, 29)]);

  // Background optimistic sync to backend API when online
  void syncTransactionToBackend(newInvoice);

  return newInvoice;
}

export function recordVisitorCheckIn(params: {
  badgeNo?: string;
  name: string;
  phone: string;
  email?: string;
  hostEmployee: string;
  purpose: string;
  visitDate?: string;
  visitTime?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}) {
  const badgeNo = params.badgeNo || `VIS-${Math.floor(10000 + Math.random() * 90000)}`;
  const visitDate = params.visitDate || new Date().toISOString().slice(0, 10);
  const appointmentDate = params.appointmentDate || visitDate;
  const now = new Date();
  const fallbackTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const visitTime = params.visitTime || fallbackTime;
  const appointmentTime = params.appointmentTime || visitTime;
  const checkIn = `${visitDate}, ${visitTime}${appointmentTime ? ` (Appt: ${appointmentDate} ${appointmentTime})` : ""}`;

  const newVisitor: UnifiedVisitorLog = {
    id: `vis_${Date.now()}`,
    badgeNo,
    name: params.name,
    phone: params.phone,
    email: params.email,
    hostEmployee: params.hostEmployee,
    purpose: params.purpose,
    visitDate,
    visitTime,
    appointmentDate,
    appointmentTime,
    checkIn,
    checkOut: null,
    status: "CHECKED_IN",
  };

  const currentVisitors = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
  writeStorage(STORAGE_KEYS.VISITORS, [newVisitor, ...currentVisitors]);

  recordPlatformTransaction({
    source: ServiceSlug.VISITORS,
    activityType: "VISIT",
    activitySummary: `Visitor Check-In (${params.purpose} with ${params.hostEmployee}) — Visit: ${visitDate} ${visitTime} / Appt: ${appointmentDate} ${appointmentTime}`,
    invoiceNo: badgeNo,
    customer: params.name,
    amountKobo: 0,
    location: "HQ Reception Kiosk",
    status: "CHECKED_IN",
    actor: "Front Desk Kiosk",
    createdAt: visitDate,
  });

  return newVisitor;
}

// ---------------------------------------------------------------------------
// React Hook for Unified Platform State
// ---------------------------------------------------------------------------

export function usePlatformStore() {
  const [products, setProducts] = useState<UnifiedProduct[]>(DEFAULT_UNIFIED_PRODUCTS);
  const [invoices, setInvoices] = useState<UnifiedInvoiceActivity[]>(DEFAULT_UNIFIED_INVOICES);
  const [activities, setActivities] = useState<UnifiedActivityLogItem[]>(DEFAULT_UNIFIED_ACTIVITIES);
  const [paymentDues, setPaymentDues] = useState<UnifiedPaymentDue[]>(DEFAULT_PAYMENT_DUES);
  const [targets, setTargets] = useState<UnifiedMonthlyTargets>(DEFAULT_MONTHLY_TARGETS);
  const [cartItems, setCartItems] = useState<UnifiedCartItem[]>(DEFAULT_CART_ITEMS);
  const [visitors, setVisitors] = useState<UnifiedVisitorLog[]>(DEFAULT_VISITORS);
  const [roomStatuses, setRoomStatuses] = useState<Record<string, "AVAILABLE" | "OCCUPIED" | "CLEANING">>(DEFAULT_ROOM_STATUSES);
  const [paymentSettings, setPaymentSettings] = useState<UnifiedPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [globalServiceFilter, setGlobalServiceFilter] = useState<ServiceSlug | "ALL">("ALL");
  const [globalLocationFilter, setGlobalLocationFilter] = useState<string>("ALL");

  const syncFromStorage = useCallback(() => {
    setProducts(readProductsStorage());
    setInvoices(readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES));
    setActivities(readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES));
    setPaymentDues(readStorage(STORAGE_KEYS.DUES, DEFAULT_PAYMENT_DUES));
    setTargets(readStorage(STORAGE_KEYS.TARGETS, DEFAULT_MONTHLY_TARGETS));
    setCartItems(readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS));
    setVisitors(readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS));
    setRoomStatuses(readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES));
    setPaymentSettings(readStorage(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS));
    setGlobalServiceFilter(readStorage(STORAGE_KEYS.GLOBAL_SERVICE_FILTER, "ALL"));
    setGlobalLocationFilter(readStorage(STORAGE_KEYS.GLOBAL_LOCATION_FILTER, "ALL"));
  }, []);

  useEffect(() => {
    syncFromStorage();
    const handleStorage = () => syncFromStorage();
    window.addEventListener(STORE_EVENT, handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(STORE_EVENT, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncFromStorage]);

  const saveProduct = useCallback(
    (product: Partial<UnifiedProduct> & { name: string; source: ServiceSlug }) => {
      const current = readProductsStorage();
      const isExisting = Boolean(product.id && current.some((p) => p.id === product.id));

      // If user adds or re-saves a product, remove its ID/SKU from the deletion blacklist
      const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
      if (deletedList.length > 0) {
        const idLower = (product.id || "").toLowerCase();
        const skuLower = (product.sku || "").toLowerCase();
        const filteredDeleted = deletedList.filter(
          (d) => d.toLowerCase() !== idLower && d.toLowerCase() !== skuLower
        );
        if (filteredDeleted.length !== deletedList.length) {
          writeStorage(STORAGE_KEYS.DELETED_PRODUCTS, filteredDeleted);
        }
      }

      // Synchronize priceKobo with priceDisplay edits from admin form
      const rawDigits = Number(String(product.priceDisplay || "").replace(/[^0-9]/g, ""));
      const priceKobo =
        rawDigits > 0
          ? rawDigits * 100
          : typeof product.priceKobo === "number" && product.priceKobo > 0
          ? product.priceKobo
          : 0;
      const priceDisplay =
        product.priceDisplay && product.priceDisplay.trim()
          ? product.priceDisplay
          : formatCurrency(priceKobo);
      const primaryImage =
        (product.imageUrl && product.imageUrl.trim()) ||
        (product.images?.[0] && product.images[0].trim()) ||
        "";

      const cleanImages = (product.images || []).filter((img) => Boolean(img && img.trim()));

      const normalized: UnifiedProduct = {
        id: isExisting ? product.id! : `p_${Date.now()}`,
        source: product.source,
        sku: product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: product.name,
        label: product.label || product.description || "Featured",
        description: product.description || product.label || "",
        priceKobo,
        costKobo: product.costKobo ?? Math.round(priceKobo * 0.75),
        priceDisplay,
        imageUrl: primaryImage,
        images: cleanImages.length > 0 ? cleanImages : primaryImage ? [primaryImage] : [],
        status: product.status || "ACTIVE",
        totalStock: typeof product.totalStock === "number" ? product.totalStock : 15,
        lowStockAt: typeof product.lowStockAt === "number" ? product.lowStockAt : 5,
        isFeatured: product.isFeatured ?? true,
        isNew: product.isNew ?? false,
        capacity: product.capacity,
        amenities: product.amenities,
        createdAt: product.createdAt || new Date().toISOString().slice(0, 10),
      };

      const updated = isExisting
        ? current.map((p) => (p.id === normalized.id ? normalized : p))
        : [normalized, ...current];

      writeStorage(STORAGE_KEYS.PRODUCTS, updated);

      // Also log activity
      const currentActs = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
      const actItem: UnifiedActivityLogItem = {
        id: `act_${Date.now()}`,
        source: normalized.source,
        time: "Just now",
        actor: "Super Admin",
        action: `${isExisting ? "updated" : "added"} product/service "${normalized.name}" (${normalized.label})`,
        amount: normalized.priceDisplay,
        location: "Admin Dashboard",
      };
      writeStorage(STORAGE_KEYS.ACTIVITIES, [actItem, ...currentActs.slice(0, 29)]);

      // Background optimistic sync to backend API when online
      void syncProductToBackend(normalized);

      return normalized;
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
    const current = readProductsStorage();
    const target = current.find((p) => p.id === id);
    const updated = current.filter((p) => p.id !== id);

    // Permanently record ID and SKU in deletion blacklist so deleted demo products never reappear!
    const deletedList = readStorage<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
    const newDeleted = new Set(deletedList.map((d) => String(d).toLowerCase()));
    newDeleted.add(id.toLowerCase());
    if (target?.sku) {
      newDeleted.add(target.sku.toLowerCase());
    }
    writeStorage(STORAGE_KEYS.DELETED_PRODUCTS, Array.from(newDeleted));

    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    // Background optimistic sync to backend API when online
    void deleteProductFromBackend(target?.sku || id);

    if (target) {
      const currentActs = readStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_UNIFIED_ACTIVITIES);
      writeStorage(STORAGE_KEYS.ACTIVITIES, [
        {
          id: `act_${Date.now()}`,
          source: target.source,
          time: "Just now",
          actor: "Super Admin",
          action: `removed product/service "${target.name}" from website`,
          amount: null,
          location: "Admin Dashboard",
        },
        ...currentActs.slice(0, 29),
      ]);
    }
  }, []);

  const restockProduct = useCallback((id: string, addedQty = 25) => {
    const current = readProductsStorage();
    const updated = current.map((p) => {
      if (p.id !== id) return p;
      const newStock = (p.totalStock || 0) + addedQty;
      return {
        ...p,
        totalStock: newStock,
        status: "ACTIVE" as const,
      };
    });
    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    const target = current.find((p) => p.id === id);
    if (target) {
      recordPlatformTransaction({
        source: target.source,
        activityType: "EXPENSE",
        activitySummary: `Inventory Restock (+${addedQty} units) — ${target.name}`,
        customer: "Warehouse Restock",
        amountKobo: (target.costKobo || Math.round(target.priceKobo * 0.7)) * addedQty,
        status: "RECEIVED",
        location: "Central Warehouse",
        actor: "Storekeeper / Admin",
      });
    }
  }, []);

  const settlePaymentDue = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.DUES, DEFAULT_PAYMENT_DUES);
    const due = current.find((d) => d.id === id);
    if (!due) return;

    const remaining = current.filter((d) => d.id !== id);
    writeStorage(STORAGE_KEYS.DUES, remaining);

    // Update matching invoice if present
    const currentInvoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_UNIFIED_INVOICES);
    const updatedInvoices = currentInvoices.map((inv) =>
      inv.invoiceNo === due.referenceNo ? { ...inv, status: "PAID" } : inv
    );
    writeStorage(STORAGE_KEYS.INVOICES, updatedInvoices);

    recordPlatformTransaction({
      source: due.source,
      activityType: due.type === "SALES" ? "SALE" : "EXPENSE",
      activitySummary: `${due.type === "SALES" ? "Debtor Payment Received" : "Supplier Balance Settled"} — Ref ${due.referenceNo}`,
      invoiceNo: `${due.referenceNo}-PAY`,
      customer: due.partyName,
      amountKobo: due.dueAmountKobo,
      status: "PAID",
      location: "Accounts Desk",
      actor: "Accountant / Admin",
    });
  }, []);

  const updateTargets = useCallback((newTargets: UnifiedMonthlyTargets) => {
    writeStorage(STORAGE_KEYS.TARGETS, newTargets);
  }, []);

  const updateGlobalServiceFilter = useCallback((service: ServiceSlug | "ALL") => {
    writeStorage(STORAGE_KEYS.GLOBAL_SERVICE_FILTER, service);
  }, []);

  const updateGlobalLocationFilter = useCallback((locationId: string) => {
    writeStorage(STORAGE_KEYS.GLOBAL_LOCATION_FILTER, locationId);
  }, []);

  const addToCart = useCallback(
    (item: { productId: string; name: string; sku: string; priceKobo: number; qty?: number; image: string }) => {
      const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
      const existing = current.find((c) => c.productId === item.productId || c.sku === item.sku);
      const qtyToAdd = item.qty || 1;

      let updated: UnifiedCartItem[];
      if (existing) {
        updated = current.map((c) =>
          c.id === existing.id ? { ...c, qty: c.qty + qtyToAdd } : c
        );
      } else {
        const newItem: UnifiedCartItem = {
          id: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          priceKobo: item.priceKobo,
          qty: qtyToAdd,
          image: item.image,
        };
        updated = [...current, newItem];
      }
      writeStorage(STORAGE_KEYS.CART, updated);
      return updated;
    },
    []
  );

  const updateCartQty = useCallback((id: string, qty: number) => {
    const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
    if (qty <= 0) {
      const filtered = current.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.CART, filtered);
      return filtered;
    }
    const updated = current.map((c) => (c.id === id ? { ...c, qty } : c));
    writeStorage(STORAGE_KEYS.CART, updated);
    return updated;
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
    const filtered = current.filter((c) => c.id !== id);
    writeStorage(STORAGE_KEYS.CART, filtered);
    return filtered;
  }, []);

  const clearCart = useCallback(() => {
    writeStorage(STORAGE_KEYS.CART, []);
  }, []);

  const addVisitor = useCallback(
    (params: {
      badgeNo?: string;
      name: string;
      phone: string;
      email?: string;
      hostEmployee: string;
      purpose: string;
      visitDate?: string;
      visitTime?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    }) => {
      return recordVisitorCheckIn(params);
    },
    []
  );

  const checkoutVisitor = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const outTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updated = current.map((v) =>
      v.id === id ? { ...v, status: "CHECKED_OUT" as const, checkOut: outTime } : v
    );
    writeStorage(STORAGE_KEYS.VISITORS, updated);
  }, []);

  const deleteVisitor = useCallback((id: string) => {
    const current = readStorage(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    writeStorage(
      STORAGE_KEYS.VISITORS,
      current.filter((v) => v.id !== id)
    );
  }, []);

  const setRoomStatus = useCallback((roomId: string, status: "AVAILABLE" | "OCCUPIED" | "CLEANING") => {
    const current = readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES);
    const updated = { ...current, [roomId]: status };
    writeStorage(STORAGE_KEYS.ROOM_STATUSES, updated);
  }, []);

  const toggleRoomStatus = useCallback((roomId: string) => {
    const current = readStorage(STORAGE_KEYS.ROOM_STATUSES, DEFAULT_ROOM_STATUSES);
    const curr = current[roomId] || "AVAILABLE";
    const next = curr === "AVAILABLE" ? "OCCUPIED" : curr === "OCCUPIED" ? "CLEANING" : "AVAILABLE";
    const updated = { ...current, [roomId]: next };
    writeStorage(STORAGE_KEYS.ROOM_STATUSES, updated);
    return next;
  }, []);

  const updatePaymentSettings = useCallback((updated: Partial<UnifiedPaymentSettings>) => {
    const current = readStorage(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS);
    const next: UnifiedPaymentSettings = {
      paystack: { ...current.paystack, ...(updated.paystack || {}) },
      razorpay: { ...current.razorpay, ...(updated.razorpay || {}) },
      stripe: { ...current.stripe, ...(updated.stripe || {}) },
      paypal: { ...current.paypal, ...(updated.paypal || {}) },
    };
    writeStorage(STORAGE_KEYS.PAYMENT_SETTINGS, next);
    setPaymentSettings(next);
    return next;
  }, []);

  return {
    products,
    invoices,
    activities,
    paymentDues,
    targets,
    cartItems,
    visitors,
    roomStatuses,
    paymentSettings,
    globalServiceFilter,
    globalLocationFilter,
    saveProduct,
    deleteProduct,
    restockProduct,
    settlePaymentDue,
    updateTargets,
    updateGlobalServiceFilter,
    updateGlobalLocationFilter,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addVisitor,
    checkoutVisitor,
    deleteVisitor,
    setRoomStatus,
    toggleRoomStatus,
    updatePaymentSettings,
    recordTransaction: recordPlatformTransaction,
  };
}

export function getPlatformCart(): UnifiedCartItem[] {
  return readStorage(STORAGE_KEYS.CART, DEFAULT_CART_ITEMS);
}

export function clearPlatformCart(): void {
  writeStorage(STORAGE_KEYS.CART, []);
}
