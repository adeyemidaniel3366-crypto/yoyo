/** @type {import('next').NextConfig} */
const path = require("path");

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
    // - Paystack, Flutterwave, Stripe, PayPal, Razorpay: payment gateways listed on the platform
    // - https: images from S3/CDN/Unsplash/external product URLs
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.flutterwave.com https://js.stripe.com https://www.paypal.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.paystack.co https://api.flutterwave.com https://api.stripe.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://api.razorpay.com https://api.ng.termii.com",
      "frame-src 'self' https://checkout.paystack.com https://checkout.flutterwave.com https://js.stripe.com https://checkout.stripe.com https://www.paypal.com https://www.sandbox.paypal.com https://api.razorpay.com",
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
    };
    return config;
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
