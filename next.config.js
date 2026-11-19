/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Exceptions documented:
    // - fonts.googleapis.com & fonts.gstatic.com: Google Fonts (Inter, Playfair Display, Poppins)
    // - api.paystack.co, checkout.paystack.com, api.flutterwave.com, checkout.flutterwave.com: payment gateways
    // - images.unsplash.com: seeded demo images
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.flutterwave.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://via.placeholder.com https://billstacks.com https://zinoapartments.com https://devicegalaxy.com https://dev.topbuildersbest.com",
      "connect-src 'self' https://api.paystack.co https://api.flutterwave.com",
      "frame-src 'self' https://checkout.paystack.com https://checkout.flutterwave.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ["pdfkit", "sharp", "pino", "exceljs"],
  },
  images: {
    domains: [
      "billstacks.com",
      "zinoapartments.com",
      "devicegalaxy.com",
      "dev.topbuildersbest.com",
      "images.unsplash.com",
      "via.placeholder.com",
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_PLATFORM_NAME: process.env.NEXT_PUBLIC_PLATFORM_NAME || "Zino One",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Visitor kiosk allows camera for photo capture (§17)
        source: "/visit/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
