import type { MetadataRoute } from "next";

const SITE = "https://noor-ul-quran.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private / app-only / auth surfaces out of the index.
      disallow: ["/admin", "/api/", "/login", "/signup", "/redeem", "/report", "/certificate"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
