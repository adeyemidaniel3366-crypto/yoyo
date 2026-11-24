import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://zinoone.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/apartments", "/shop", "/spark", "/builders", "/billstacks", "/visit", "/privacy", "/terms", "/refund-policy"],
        disallow: ["/admin/", "/staff/", "/api/", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
