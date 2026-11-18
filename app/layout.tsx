import type { Metadata } from "next";
import "./globals.css";
import { PLATFORM_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} — Unified Business Platform`,
  description: "One place for everything we do. Six businesses, one front door, one login, one admin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-content-bg text-body antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
