import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://zinoone.com";
  const now = new Date();

  const publicRoutes = [
    "",
    "/apartments",
    "/shop",
    "/spark",
    "/builders",
    "/billstacks",
    "/visit",
    "/privacy",
    "/terms",
    "/refund-policy",
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/privacy") || route.startsWith("/terms") || route.startsWith("/refund") ? 0.3 : 0.8,
  }));
}
