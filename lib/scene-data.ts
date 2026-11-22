// ---------------------------------------------------------------------------
// zino one — Master Digital Environment Data & Configuration
// ---------------------------------------------------------------------------

export interface SceneProject {
  id: string;
  name: string;
  tagline: string;
  category: "SOFTWARE_SYSTEM" | "ECOMMERCE" | "HOSPITALITY" | "FINTECH" | "HARDWARE_POS" | "SECURITY";
  status: "ACTIVE_PRODUCTION" | "LIVE_PLATFORM" | "EXPANDING" | "PROTOTYPE";
  year: string;
  description: string;
  technologies: string[];
  metrics?: string;
  primaryHref: string;
  githubHref?: string;
  featured: boolean;
  color: "turquoise" | "peach" | "orange-red";
  image: string;
}

export interface SceneExperiment {
  id: string;
  title: string;
  codename: string;
  type: string;
  description: string;
  interactiveKey: "KINETIC_SHAPES" | "FREQUENCY_SYNTH" | "GRID_MATRIX" | "COMMAND_SHELL";
  status: "EXPLORING" | "BETA_LAB" | "EXPERIMENTAL";
  accent: "turquoise" | "peach" | "orange-red";
}

export interface SceneInternetPortal {
  id: string;
  title: string;
  role: string;
  url: string;
  description: string;
  badge: string;
  type: "PARTNER_PORTAL" | "DEVELOPER" | "ENTERPRISE";
}

export interface SceneArchiveItem {
  year: string;
  quarter: string;
  title: string;
  category: string;
  summary: string;
  impact: string;
}

export const SCENE_ONE_PROFILE = {
  name: "Zino company",
  codename: "zino one",
  email: "adeyemiZino3366@gmail.com",
  github: "https://github.com/adeyemiZino3366-crypto",
  domain: "Personal Digital Environment & Creative Studio",
  role: "Systems Architect & Full-Stack Engineer",
  location: "Lagos, Nigeria",
  headline: "ENGINEERING DIGITAL WORLDS & HIGH-SCALE COMPUTATION.",
  subhead:
    "zino one is my personal digital hub—an interactive home uniting full-scale software systems, business applications, digital tools, and internet platforms.",
  bio: [
    "I design and engineer robust software architectures that bridge multi-subsidiary commerce, real-time financial tracking, spatial digital interfaces, and modern full-stack web applications.",
    "zino one is an active playground and command center for all my projects, systems, experiments, and digital ventures.",
  ],
  stats: [
    { label: "Active Platforms", value: "6+" },
    { label: "Production Routes", value: "162" },
    { label: "Database Models", value: "35+" },
    { label: "Uptime & Quality", value: "99.9%" },
  ],
};

export const SCENE_LIVE_ACTIVITY = {
  currentlyBuilding: "Zino One Enterprise Commerce Core & Autonomous Multi-Agent Workflows",
  currentlyExploring: "Spatial generative web canvases, local-first architectures & edge caching",
  currentlyLearning: "Advanced WebGL procedural geometry, distributed ledger verification & KaTeX rendering",
  currentStatus: "Building high-performance software systems in Lagos · Available for select ventures",
  updatedAt: "November 2026",
};

export const SCENE_PROJECTS: SceneProject[] = [
  {
    id: "proj_zino_one",
    name: "Zino One Unified Business Platform",
    tagline: "Cross-subsidiary enterprise operations & unified financial engine",
    category: "SOFTWARE_SYSTEM",
    status: "ACTIVE_PRODUCTION",
    year: "2026",
    description:
      "A complete unified platform operating 6 businesses under one centralized login, live financial ledger, RBAC permissions, and real-time state synchronization across retail, e-commerce, building supply, and hospitality.",
    technologies: ["Next.js 14", "TypeScript", "Prisma ORM", "PostgreSQL", "Tailwind CSS", "Zustand"],
    metrics: "162 routes · 6 Business Engines · Multi-Tenant State",
    primaryHref: "/admin",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: true,
    color: "orange-red",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "proj_device_galaxy",
    name: "Device Galaxy",
    tagline: "High-performance electronics & gadgets e-commerce storefront",
    category: "ECOMMERCE",
    status: "LIVE_PLATFORM",
    year: "2026",
    description:
      "Modern e-commerce storefront with same-day Lagos dispatch, uniform product galleries, instant technical spec drawers, promotional coupon engine, and integrated Paystack checkout.",
    technologies: ["Next.js App Router", "Tailwind CSS", "Paystack Webhooks", "Idempotent Orders"],
    metrics: "Same-Day Lagos Delivery · Verified Brand Warranty",
    primaryHref: "/shop",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: true,
    color: "turquoise",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "proj_zino_apartments",
    name: "Zino Luxury Apartments & Suites",
    tagline: "Hotel PMS, suite booking engine & front desk room matrix",
    category: "HOSPITALITY",
    status: "LIVE_PLATFORM",
    year: "2026",
    description:
      "Complete hospitality management software with interactive room rack, walk-in check-in/out, automated 10% tourism tax computation, guest concierge support, and caution deposit tracking.",
    technologies: ["Next.js 14", "Tailwind CSS", "Full PMS Calendar", "Prisma"],
    metrics: "12 Luxury Suites · Lekki Phase 1 · Automated Invoicing",
    primaryHref: "/apartments",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: true,
    color: "peach",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "proj_top_builders",
    name: "Top Builders Materials Yard",
    tagline: "Heavy building materials dispatch & debtor tracking ledger",
    category: "SOFTWARE_SYSTEM",
    status: "ACTIVE_PRODUCTION",
    year: "2026",
    description:
      "Yard logistics application handling cement bag dispatches, 16mm TMT iron rod tonnage tracking, stock sheet batch ST-00021, and debtor credit collection books.",
    technologies: ["Yard Sales Book", "Debtor Aging", "Stock In/Out", "Dispatch Vouchers"],
    metrics: "Daily Sales Book · Cement & Steel Yard Logistics",
    primaryHref: "/builders",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: false,
    color: "orange-red",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "proj_billstacks",
    name: "Billstacks Cloud Invoicing",
    tagline: "SaaS financial accounting & recurring billing automation",
    category: "FINTECH",
    status: "LIVE_PLATFORM",
    year: "2026",
    description:
      "Corporate financial engine with automated recurring retainer invoices, operating expense categorization, 7.5% FIRS VAT returns, and multi-format PDF/Excel exports.",
    technologies: ["FIRS Tax Math", "Recurring Invoices", "ExcelJS & PDFKit", "Financial Auditing"],
    metrics: "Automated VAT Schedules · Enterprise B2B Retainers",
    primaryHref: "/billstacks",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: false,
    color: "peach",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "proj_visitor_kiosk",
    name: "Premises Security & Visitor Kiosk",
    tagline: "Front-desk digital kiosk, QR pass check-in & attendance",
    category: "SECURITY",
    status: "LIVE_PLATFORM",
    year: "2026",
    description:
      "Self-service touchscreen check-in kiosk for corporate headquarters, generating instant QR passes, host notification alerts, VIP pre-registration, and employee attendance clock-in.",
    technologies: ["Digital Badge Pass", "Biometric Clock-In", "Host Extension Routing", "VIP Invites"],
    metrics: "Touchscreen Kiosk · Badge Printing · Fast Pass",
    primaryHref: "/visit",
    githubHref: "https://github.com/adeyemiZino3366-crypto/yoyo",
    featured: false,
    color: "turquoise",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=80",
  },
];

export const SCENE_EXPERIMENTS: SceneExperiment[] = [
  {
    id: "exp_kinetic_geometry",
    title: "Kinetic Polyhedron & Spatial Mesh",
    codename: "EXP-01 // MESH",
    type: "Interactive Canvas & Procedural Shapes",
    description:
      "A real-time interactive canvas rendered with zino one brand colors (Turquoise, Cream, Peach, and Orange-Red) responding to cursor proximity and physics vectors.",
    interactiveKey: "KINETIC_SHAPES",
    status: "BETA_LAB",
    accent: "turquoise",
  },
  {
    id: "exp_frequency_synth",
    title: "Harmonic Waveform & Frequency Modulator",
    codename: "EXP-02 // SYNTH",
    type: "Audio/Visual Resonance Simulator",
    description:
      "Interactive harmonic wave generator calculating oscillation physics, frequency dampening, and resonance harmonics across multi-tone spectrums.",
    interactiveKey: "FREQUENCY_SYNTH",
    status: "EXPLORING",
    accent: "peach",
  },
  {
    id: "exp_grid_matrix",
    title: "Adaptive Data Matrix & Spatial Grid",
    codename: "EXP-03 // MATRIX",
    type: "Digital Spatial Coordinates",
    description:
      "Geometric coordinate system exploring brutalist grid intersections, mouse cursor ripples, and isometric typography placement.",
    interactiveKey: "GRID_MATRIX",
    status: "BETA_LAB",
    accent: "orange-red",
  },
  {
    id: "exp_command_shell",
    title: "zino one Embedded Command Shell",
    codename: "EXP-04 // SHELL",
    type: "Virtual Terminal & System Monitor",
    description:
      "A functional in-browser terminal emulator executing zino one diagnostic commands, status probes, project queries, and portal launches.",
    interactiveKey: "COMMAND_SHELL",
    status: "EXPERIMENTAL",
    accent: "turquoise",
  },
];

export const SCENE_INTERNET_PORTALS: SceneInternetPortal[] = [
  {
    id: "port_neadston",
    title: "Neadston Limited",
    role: "Sales & Corporate Solutions Portal",
    url: "https://sales.neadstonltd.com/",
    description: "Enterprise sales, business expansion, and corporate operational platform.",
    badge: "Official Partner Portal",
    type: "PARTNER_PORTAL",
  },
  {
    id: "port_esto_world",
    title: "Esto World",
    role: "Digital Sales Ecosystem",
    url: "https://sales.estoworld.com/login",
    description: "Commercial sales operations, client authentication, and partner workspace.",
    badge: "Official Partner Ecosystem",
    type: "PARTNER_PORTAL",
  },
];

export const SCENE_ARCHIVE: SceneArchiveItem[] = [
  {
    year: "2026",
    quarter: "Q4",
    title: "Zino One Full 6-Business Unified System Release",
    category: "Architecture Milestone",
    summary: "Architected single Next.js 14 App Router repository orchestrating all 6 subsidiaries under one state and admin core.",
    impact: "162 routes generated, 16 domain unit tests passing, zero TypeScript errors.",
  },
  {
    year: "2026",
    quarter: "Q3",
    title: "Device Galaxy E-Commerce & Same-Day Dispatch",
    category: "Product Launch",
    summary: "Built high-speed online gadgets catalog with uniform image containers, spec drawers, and instant checkout.",
    impact: "Unified shopping cart and Paystack webhooks integration.",
  },
  {
    year: "2026",
    quarter: "Q2",
    title: "Apartments Hospitality PMS & Room Matrix",
    category: "Full-Stack System",
    summary: "Engineered room rack matrix for 12 serviced suites in Lekki, automated front desk check-in and 10% tax calculation.",
    impact: "Eliminated manual paper logbooks and double-bookings.",
  },
];
