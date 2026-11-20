Ran check missing route existence
Ran list all route paths
Ran list all API routes

Here is a comprehensive breakdown of everything currently missing, incomplete, or recommended to elevate the platform from a working prototype to a fully hardened, production-grade enterprise system:

---

### 1. Essential Missing Pages & User Experience
* **Custom 404 Page (`app/not-found.tsx`)**: Missing. If a visitor types an invalid URL (e.g. `/shop/unknown-product`), Next.js displays the raw default 404 screen instead of a branded Scene One / Zino navigation page.
* **Global Error Boundary (`app/error.tsx`)**: Missing. Any unexpected client-side crash displays Next.js error overlays rather than a polite "Something went wrong — Return to Hub" recovery screen.
* **Customer Account Portal (`/account` / `/account/orders` / `/account/bookings`)**: While staff have the comprehensive `/admin` suite, public customers currently lack a self-service dashboard to log in, track their e-commerce orders, or retrieve their apartment booking passes.
* **Apartment Booking Pass / Voucher Screen (`/apartments/booking/[ref]`)**: When a guest books an apartment, they receive a booking code, but there is no dedicated printable / downloadable digital boarding pass with a QR code for front-desk scanning.

---

### 2. Legal, Compliance & Trust Pages
* **Privacy Policy (`/privacy`)**: Missing. Standard requirement for processing payments (Paystack/Flutterwave) and collecting guest emails/phone numbers.
* **Terms of Service & Rental Rules (`/terms`)**: Missing. Essential for Zino Apartments (check-in/check-out policies, caution deposit rules, damage liabilities) and Device Galaxy warranty claims.
* **Refund & Cancellation Policy (`/refund-policy`)**: Missing. Required by Nigerian payment gateways and card networks (Mastercard/Visa).

---

### 3. Production Environment & Third-Party Integrations
The site currently runs in **offline / in-memory fallback mode**. To deploy to live production with real users and payments, the following external API keys and services need to be configured:
* **Live PostgreSQL Database (`DATABASE_URL`)**:
  * *Current state*: Database fallback in-memory store is active to prevent crashes on machines without local Postgres.
  * *Missing*: Managed PostgreSQL instance (e.g., Supabase, Neon, or Railway) to permanently persist transactions, users, and room states across server reboots.
* **Live Payment Gateways (`PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY`)**:
  * *Current state*: Checkout processes transactions in simulated/test mode.
  * *Missing*: Live merchant keys for real Nigerian debit card, bank transfer, and USSD payments.
* **SMS Gateway (`TERMII_API_KEY`)**:
  * *Current state*: Disabled (logged to console).
  * *Missing*: Real SMS delivery for instant booking confirmation codes, delivery updates, and visitor kiosk access OTPs.
* **Transactional Email Service (`RESEND_API_KEY` or SMTP)**:
  * *Current state*: Email alerts are logged locally.
  * *Missing*: Automated dispatch of PDF invoices, booking vouchers, and password reset links to customers.
* **Cloud File Storage (`S3_BUCKET` / Cloudflare R2)**:
  * *Current state*: File uploads are saved to local `public/uploads/`.
  * *Missing*: S3 or Cloudflare R2 bucket for production serverless deployments (where local disk is ephemeral).
* **Distributed Cache / Rate Limiter (`UPSTASH_REDIS_REST_URL`)**:
  * *Current state*: In-memory token bucket rate limiting.
  * *Missing*: Upstash Redis connection for multi-instance production clustering.

---

### 4. Search Engine Optimization (SEO) & Web Standards
* **Dynamic XML Sitemap (`app/sitemap.ts`)**: Missing. Search engines (Google/Bing) need this to index all apartment suites, blog posts, and e-commerce gadgets.
* **Robots.txt (`app/robots.ts`)**: Missing. Needed to instruct search engines to index public pages while explicitly disallowing private routes like `/admin/*` and `/api/*`.
* **Social Preview Cards (`opengraph-image.png` / `twitter-image.png`)**: Missing. When sharing links to Zino Apartments or Device Galaxy on WhatsApp, Twitter, or iMessage, no custom preview card appears.
* **Web App Manifest (`manifest.json`)**: Missing. Adding this would allow the Visitor Kiosk (`/visit`) and POS terminal (`/admin/spark/pos`) to be installed as full-screen Progressive Web Apps (PWA) on tablets.

---

### 5. Subsidiary-Specific Feature Gaps
| Service | Current State | Missing Feature |
| :--- | :--- | :--- |
| **Zino Apartments** | Public catalog, details page & admin room manager | • Real-time calendar availability block-out dates.<br>• Automated ₦20,000 caution deposit refund workflow. |
| **Device Galaxy** | Storefront, cart, and checkout pipeline | • Multi-item filtering by technical specs (RAM, Storage, GPU).<br>• Direct customer review submission modal with star rating on public product pages. |
| **Top Builders** | Sales book, yard stock, and debtors ledger | • Downloadable PDF Product Price Sheet for contractors.<br>• Bulk quote request form directly on the public landing page. |
| **Billstacks** | SaaS invoicing, estimates, and tax engine | • Interactive public demo allowing prospective clients to preview generating an invoice without logging in. |
| **Visitor Kiosk** | Tablet check-in and attendance logging | • Webcam photo capture component to snap visitor portraits upon badge issuance. |

---

### Suggested Next Steps:
Would you like me to implement:
1. **The missing essential pages** (Custom 404, Error Boundary, Terms of Service, and Privacy Policy)?
2. **The customer self-service booking voucher / order pass page**?
3. **SEO files (`sitemap.ts` and `robots.ts`)**?