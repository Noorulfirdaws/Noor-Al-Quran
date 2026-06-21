import type { MetadataRoute } from "next";
import { blogPosts } from "./data/siteData";
import { products } from "./data/products";

const SITE = "https://noor-ul-quran.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static, indexable routes (exclude app-only / auth / admin / print pages).
  const staticPaths = [
    "", "/quran", "/blog", "/library", "/demo", "/dashboard", "/goals",
    "/revision", "/recordings", "/ramadan-hub", "/hifz-network",
    "/scholarships", "/careers", "/support", "/feature-requests",
    "/privacy", "/terms", "/cookies",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const libraryEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/library/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // 114 surah reader pages.
  const surahEntries: MetadataRoute.Sitemap = Array.from({ length: 114 }, (_, i) => ({
    url: `${SITE}/quran/${i + 1}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries, ...libraryEntries, ...surahEntries];
}
