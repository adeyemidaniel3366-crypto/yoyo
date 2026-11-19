// ---------------------------------------------------------------------------
// Zino One — Demo Seed Script (§19)
// Re-runnable, idempotent spine, reset guard for production.
// ---------------------------------------------------------------------------

import { PrismaClient, Role, ServiceSlug, ContactType, ProductStatus, SaleStatus, InvoiceStatus, BookingStatus, OrderStatus, PaymentStatus, RoomStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";

async function main() {
  const isReset = process.argv.includes("--reset");

  if (isReset) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED_RESET !== "true") {
      throw new Error("Refusing to wipe database in production without ALLOW_SEED_RESET=true");
    }
    console.log("Resetting transactional data...");
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.compareItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.coupon.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.roomType.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.stockAdjustmentItem.deleteMany({});
    await prisma.stockAdjustment.deleteMany({});
    await prisma.stockTransferItem.deleteMany({});
    await prisma.stockTransfer.deleteMany({});
    await prisma.stockSheetItem.deleteMany({});
    await prisma.stockSheet.deleteMany({});
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.recurringInvoice.deleteMany({});
    await prisma.estimate.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.cashDrawerSession.deleteMany({});
    await prisma.stockLevel.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.visit.deleteMany({});
    await prisma.preRegister.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.designation.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.sequence.deleteMany({});
    await prisma.webhookEvent.deleteMany({});
    await prisma.idempotencyKey.deleteMany({});
    await prisma.platformSetting.deleteMany({});
    console.log("Database reset complete.");
  }

  console.log("Seeding platform spine...");

  // 1. Services
  const services = [
    { slug: ServiceSlug.BILLSTACKS, name: "Billstacks", shortName: "Billstacks", color: "#28A745", sortOrder: 1 },
    { slug: ServiceSlug.BUILDERS, name: "Top Builders", shortName: "Builders", color: "#006B3F", sortOrder: 2 },
    { slug: ServiceSlug.SPARK, name: "Zino Spark", shortName: "Spark", color: "#2563EB", sortOrder: 3 },
    { slug: ServiceSlug.APARTMENTS, name: "Zino Apartments", shortName: "Apartments", color: "#1E3A5F", sortOrder: 4 },
    { slug: ServiceSlug.GALAXY, name: "Device Galaxy", shortName: "Galaxy", color: "#E74C3C", sortOrder: 5 },
    { slug: ServiceSlug.VISITORS, name: "Visitor Management", shortName: "Visitors", color: "#7C3AED", sortOrder: 6 },
  ];
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, shortName: s.shortName, color: s.color, sortOrder: s.sortOrder },
      create: s,
    });
  }

  // 2. Locations
  const locations = [
    { id: "loc_spark_adepele", name: "Zino Spark Adepele", type: "Shop", services: [ServiceSlug.SPARK], address: "Adepele Street, Computer Village, Ikeja, Lagos" },
    { id: "loc_spark_medical", name: "Zino Spark Medical Road", type: "Shop", services: [ServiceSlug.SPARK], address: "Medical Road, Computer Village, Ikeja, Lagos" },
    { id: "loc_spark_olayeni", name: "Zino Spark Olayeni Shop", type: "Shop", services: [ServiceSlug.SPARK], address: "Olayeni Street, Computer Village, Ikeja, Lagos" },
    { id: "loc_spark_wh", name: "Warehouse — Asset Corps Plaza", type: "Warehouse", services: [ServiceSlug.SPARK], address: "Asset Corps Plaza, Computer Village, Ikeja, Lagos" },
    { id: "loc_apartments_main", name: "Zino Service Apartment — MAIN", type: "Property", services: [ServiceSlug.APARTMENTS], address: "Plot 12, Lekki Phase 1, Lagos" },
    { id: "loc_galaxy_online", name: "Galaxy Online Hub", type: "Online", services: [ServiceSlug.GALAXY], address: "Virtual Warehouse / E-commerce Hub" },
    { id: "loc_builders_yard", name: "Top Builders Yard", type: "Yard", services: [ServiceSlug.BUILDERS], address: "Alaba Rago / LASU Gate Corridor, Ojo, Lagos" },
  ];
  for (const l of locations) {
    await prisma.location.upsert({
      where: { id: l.id },
      update: { name: l.name, type: l.type, services: l.services, address: l.address },
      create: l,
    });
  }

  // 3. Demo Users
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const users = [
    {
      email: "admin@zinoone.local",
      firstName: "Super",
      lastName: "Admin",
      roles: [Role.SUPER_ADMIN],
      serviceAccess: Object.values(ServiceSlug),
      locationIds: locations.map((l) => l.id),
    },
    {
      email: "manager.spark@zinoone.local",
      firstName: "Spark",
      lastName: "Manager",
      roles: [Role.SERVICE_MANAGER],
      serviceAccess: [ServiceSlug.SPARK],
      locationIds: ["loc_spark_adepele", "loc_spark_medical", "loc_spark_olayeni", "loc_spark_wh"],
    },
    {
      email: "cashier@zinoone.local",
      firstName: "Chioma",
      lastName: "Cashier",
      roles: [Role.CASHIER],
      serviceAccess: [ServiceSlug.SPARK, ServiceSlug.BUILDERS],
      locationIds: ["loc_spark_adepele", "loc_builders_yard"],
    },
    {
      email: "reception@zinoone.local",
      firstName: "Blessing",
      lastName: "Reception",
      roles: [Role.RECEPTION],
      serviceAccess: [ServiceSlug.APARTMENTS, ServiceSlug.VISITORS],
      locationIds: ["loc_apartments_main"],
    },
    {
      email: "storekeeper@zinoone.local",
      firstName: "Emeka",
      lastName: "Storekeeper",
      roles: [Role.STOREKEEPER],
      serviceAccess: [ServiceSlug.SPARK, ServiceSlug.BUILDERS],
      locationIds: ["loc_spark_wh", "loc_builders_yard"],
    },
    {
      email: "employee@zinoone.local",
      firstName: "John",
      lastName: "Employee",
      roles: [Role.EMPLOYEE],
      serviceAccess: [ServiceSlug.VISITORS],
      locationIds: [],
    },
    {
      email: "customer@zinoone.local",
      firstName: "David",
      lastName: "Customer",
      roles: [Role.CUSTOMER],
      serviceAccess: [ServiceSlug.GALAXY, ServiceSlug.APARTMENTS],
      locationIds: [],
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, roles: u.roles, serviceAccess: u.serviceAccess, locationIds: u.locationIds, password: passwordHash },
      create: { ...u, password: passwordHash },
    });
  }

  // 4. Contacts
  const contacts = [
    { name: "Alhaji Ibrahim Musa", phone: "08031234567", email: "ibrahim@musa-constructions.ng", types: [ContactType.CUSTOMER], sources: [ServiceSlug.BUILDERS, ServiceSlug.BILLSTACKS] },
    { name: "Tunde Bakare & Associates", phone: "08029876543", email: "accounts@bakarelaw.ng", types: [ContactType.CUSTOMER], sources: [ServiceSlug.BILLSTACKS] },
    { name: "Dr. Ngozi Okonjo", phone: "08055551234", email: "ngozi@okonjo-clinic.org", types: [ContactType.GUEST, ContactType.CUSTOMER], sources: [ServiceSlug.APARTMENTS, ServiceSlug.SPARK] },
    { name: "Dangote Cement Depot", phone: "08077778899", email: "sales@dangotedepot.ng", types: [ContactType.SUPPLIER], sources: [ServiceSlug.BUILDERS] },
  ];
  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { phone: c.phone },
      update: { name: c.name, email: c.email, types: c.types, sources: c.sources },
      create: c,
    });
  }

  // 5. Products & Inventory
  const products = [
    { sku: "SPK-IPHONE-15-128", slug: "iphone-15-128gb", name: "iPhone 15 128GB Black", source: ServiceSlug.SPARK, unit: "pcs", costKobo: 110000000, priceKobo: 125000000, lowStockAt: 3 },
    { sku: "SPK-MACBOOK-AIR-M2", slug: "macbook-air-m2-8-256", name: "MacBook Air 13\" M2 8/256GB Midnight", source: ServiceSlug.SPARK, unit: "pcs", costKobo: 135000000, priceKobo: 155000000, lowStockAt: 2 },
    { sku: "SPK-CHARGER-20W", slug: "apple-20w-usb-c-power-adapter", name: "Apple 20W USB-C Power Adapter", source: ServiceSlug.SPARK, unit: "pcs", costKobo: 1800000, priceKobo: 2500000, lowStockAt: 10 },
    { sku: "BLD-CEMENT-50KG", slug: "dangote-cement-50kg-bag", name: "Dangote Cement 50kg Falcon", source: ServiceSlug.BUILDERS, unit: "bag", costKobo: 820000, priceKobo: 950000, lowStockAt: 50 },
    { sku: "BLD-ROD-12MM", slug: "tmt-iron-rod-12mm-length", name: "TMT Iron Rod 12mm Length", source: ServiceSlug.BUILDERS, unit: "length", costKobo: 680000, priceKobo: 780000, lowStockAt: 30 },
    { sku: "GLX-SAMSUNG-S24", slug: "samsung-galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra 256GB Titanium", source: ServiceSlug.GALAXY, unit: "pcs", costKobo: 160000000, priceKobo: 185000000, lowStockAt: 2 },
  ];

  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, slug: p.slug, costKobo: p.costKobo, priceKobo: p.priceKobo, lowStockAt: p.lowStockAt },
      create: p,
    });

    const locId =
      p.source === ServiceSlug.SPARK
        ? "loc_spark_adepele"
        : p.source === ServiceSlug.BUILDERS
          ? "loc_builders_yard"
          : "loc_galaxy_online";

    await prisma.stockLevel.upsert({
      where: { productId_locationId: { productId: prod.id, locationId: locId } },
      update: { qty: 25 },
      create: { productId: prod.id, locationId: locId, qty: 25 },
    });
  }

  // 6. Room Types & Rooms (Apartments)
  const roomTypes = [
    { slug: "deluxe-suite", name: "Deluxe Studio Suite", description: "Spacious studio with kitchenette, high-speed WiFi and pool view.", basePriceKobo: 6500000, adults: 2, children: 1, sortOrder: 1 },
    { slug: "executive-2bed", name: "Executive 2-Bedroom Luxury Apartment", description: "Fully serviced two-bedroom luxury apartment with modern kitchen and balcony.", basePriceKobo: 12000000, adults: 4, children: 2, sortOrder: 2 },
  ];
  for (const rt of roomTypes) {
    const createdRt = await prisma.roomType.upsert({
      where: { slug: rt.slug },
      update: { name: rt.name, basePriceKobo: rt.basePriceKobo, adults: rt.adults, children: rt.children },
      create: rt,
    });

    const roomNums = rt.slug === "deluxe-suite" ? ["101", "102", "103"] : ["201", "202"];
    for (const num of roomNums) {
      await prisma.room.upsert({
        where: { number: num },
        update: { roomTypeId: createdRt.id, status: RoomStatus.AVAILABLE },
        create: { number: num, roomTypeId: createdRt.id, status: RoomStatus.AVAILABLE, floor: Number(num[0]) },
      });
    }
  }

  // 7. Departments & Designations (Visitors / HR)
  const depts = ["Executive", "Finance", "Sales & Retail", "Operations & Logistics", "Hospitality"];
  for (const d of depts) {
    await prisma.department.upsert({ where: { name: d }, update: {}, create: { name: d } });
  }

  const desigs = ["Managing Director", "Senior Accountant", "Retail Store Manager", "Front Desk Officer", "Inventory Clerk"];
  for (const d of desigs) {
    await prisma.designation.upsert({ where: { name: d }, update: {}, create: { name: d } });
  }

  // 8. Platform Settings
  const defaultSettings: Record<string, unknown> = {
    DEFAULT_TAX_PCT: 7.5,
    APARTMENTS_TAX_PCT: 10,
    LOW_STOCK_DEFAULT: 5,
    LARGE_SALE_ALERT_KOBO: 50000000,
    GALAXY_SHIPPING_FLAT_KOBO: 350000,
    GALAXY_FREE_SHIPPING_KOBO: 10000000,
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seeding finished successfully!");
  console.log("Demo logins available with password Demo1234! :");
  console.log(" • Super Admin: admin@zinoone.local");
  console.log(" • Spark Manager: manager.spark@zinoone.local");
  console.log(" • Cashier: cashier@zinoone.local");
  console.log(" • Reception: reception@zinoone.local");
  console.log(" • Storekeeper: storekeeper@zinoone.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
