// ---------------------------------------------------------------------------
// Zino One — Unified Platform Seed Script
// Seeds believable demo data across all six business units with full source labelling.
// ---------------------------------------------------------------------------

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Zino One Unified Seed...");

  // 1. Seed Services
  const services = [
    { slug: "BILLSTACKS", name: "Billstacks", shortName: "Billstacks", color: "#28A745", sortOrder: 1 },
    { slug: "BUILDERS", name: "Top Builders", shortName: "Builders", color: "#006B3F", sortOrder: 2 },
    { slug: "SPARK", name: "Zino Spark", shortName: "Spark", color: "#2563EB", sortOrder: 3 },
    { slug: "APARTMENTS", name: "Zino Apartments", shortName: "Apartments", color: "#1E3A5F", sortOrder: 4 },
    { slug: "GALAXY", name: "Device Galaxy", shortName: "Galaxy", color: "#E74C3C", sortOrder: 5 },
    { slug: "VISITORS", name: "Visitor Management", shortName: "Visitors", color: "#7C3AED", sortOrder: 6 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log("✅ Services registered (6/6)");

  // 2. Seed Locations
  const locations = [
    { id: "loc_spark_adepele", name: "Zino Spark Adepele", type: "Shop", address: "Adepele Street, Computer Village, Ikeja", services: ["SPARK"] },
    { id: "loc_spark_medical", name: "Zino Spark Medical Road", type: "Shop", address: "Medical Road, Computer Village, Ikeja", services: ["SPARK"] },
    { id: "loc_spark_olayeni", name: "Zino Spark Olayeni Shop", type: "Shop", address: "Olayeni Street, Computer Village, Ikeja", services: ["SPARK"] },
    { id: "loc_spark_wh", name: "Warehouse — Asset Corps Plaza Computer Village", type: "Warehouse", address: "Asset Corps Plaza, Ikeja", services: ["SPARK"] },
    { id: "loc_spark_oga", name: "Oga's Office (Olayeni)", type: "Office", address: "Olayeni Street, Ikeja", services: ["SPARK"] },
    { id: "loc_apartments_main", name: "Zino Service Apartment — MAIN", type: "Property", address: "Plot 12, Lekki Phase 1, Lagos", services: ["APARTMENTS"] },
    { id: "loc_galaxy_online", name: "Galaxy Online", type: "Online", address: "Virtual Warehouse / E-commerce Hub", services: ["GALAXY"] },
    { id: "loc_builders_yard", name: "Top Builders Yard", type: "Yard", address: "Alaba Rago / LASU Gate Corridor, Ojo, Lagos", services: ["BUILDERS"] },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: loc,
      create: loc,
    });
  }
  console.log("✅ Locations registered (8/8)");

  // 3. Seed Users
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@zinoone.local" },
    update: {},
    create: {
      email: "admin@zinoone.local",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Super",
      roles: ["SUPER_ADMIN"],
      serviceAccess: ["BILLSTACKS", "BUILDERS", "SPARK", "APARTMENTS", "GALAXY", "VISITORS"],
      locationIds: locations.map((l) => l.id),
    },
  });
  console.log("✅ Super Admin created (admin@zinoone.local / Admin123!)");

  // 4. Seed Top Builders Products
  const buildersProducts = [
    { code: "001", name: "Dangote Cement 50kg", category: "Cement", unit: "bag", priceKobo: 980000, costKobo: 890000 },
    { code: "002", name: "BUA Cement 50kg", category: "Cement", unit: "bag", priceKobo: 950000, costKobo: 860000 },
    { code: "003", name: "Iron Rod 12mm", category: "Iron Rods", unit: "lgth", priceKobo: 1250000, costKobo: 1100000 },
    { code: "004", name: "Iron Rod 16mm", category: "Iron Rods", unit: "lgth", priceKobo: 2150000, costKobo: 1950000 },
    { code: "005", name: "Nails 3 inch", category: "Nails", unit: "kg", priceKobo: 180000, costKobo: 150000 },
    { code: "006", name: "Nails 2 inch", category: "Nails", unit: "kg", priceKobo: 190000, costKobo: 160000 },
    { code: "007", name: "Binding Wire", category: "Binding Wire", unit: "kg", priceKobo: 160000, costKobo: 130000 },
    { code: "008", name: "Aluminium Roofing Sheet 0.45mm", category: "Roofing", unit: "sht", priceKobo: 850000, costKobo: 720000 },
    { code: "009", name: "PVC Ceiling Panel 5.95m", category: "PVC Ceiling", unit: "lgth", priceKobo: 320000, costKobo: 250000 },
    { code: "010", name: "PVC Pipe 4 inch", category: "Plumbing", unit: "lgth", priceKobo: 680000, costKobo: 560000 },
    { code: "011", name: "Floor Tiles 60x60 (1.44m²)", category: "Tiles", unit: "ctn", priceKobo: 1450000, costKobo: 1200000 },
    { code: "012", name: "Emulsion Paint 20L (White)", category: "Paints", unit: "bkt", priceKobo: 3800000, costKobo: 3100000 },
    { code: "013", name: "Mortise Door Lock", category: "Door Locks", unit: "pc", priceKobo: 850000, costKobo: 680000 },
    { code: "014", name: "Wheelbarrow (Heavy Duty)", category: "Tools", unit: "pc", priceKobo: 4800000, costKobo: 3900000 },
  ];

  for (const bp of buildersProducts) {
    await prisma.product.upsert({
      where: { sku: bp.code },
      update: {},
      create: {
        sku: bp.code,
        slug: `builders-${bp.code}`,
        name: bp.name,
        source: "BUILDERS",
        unit: bp.unit,
        priceKobo: bp.priceKobo,
        costKobo: bp.costKobo,
      },
    });
  }
  console.log("✅ Top Builders products seeded (14/14)");

  // 5. Seed Apartment Room Types
  const roomTypes = [
    { slug: "classic-studio", name: "Classic Studio", basePriceKobo: 1000000, maxAdults: 1, maxChildren: 0 },
    { slug: "compact-studio", name: "Compact Studio", basePriceKobo: 2000000, maxAdults: 2, maxChildren: 1 },
    { slug: "deluxe-studio", name: "Deluxe Studio", basePriceKobo: 3000000, maxAdults: 2, maxChildren: 1 },
    { slug: "executive-1-bedroom", name: "Executive 1-Bedroom", basePriceKobo: 4000000, maxAdults: 2, maxChildren: 2 },
    { slug: "luxury-2-bedroom", name: "Luxury 2-Bedroom", basePriceKobo: 5000000, maxAdults: 4, maxChildren: 2 },
  ];

  for (const rt of roomTypes) {
    await prisma.roomType.upsert({
      where: { slug: rt.slug },
      update: {},
      create: {
        ...rt,
        description: `Spacious ${rt.name} located at Zino Service Apartment Lekki MAIN with 24/7 power and security.`,
      },
    });
  }
  console.log("✅ Apartment room types seeded (5/5)");

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
