import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, blogPhotos } from "../../data/siteData";
import BlogPostClient from "./BlogPostClient";

const SITE = "https://noor-ul-quran.com";

// Pre-render every post at build time.
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

// Per-post SEO: dynamic title/description + Open Graph + Twitter cards.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found — Noor-ul-Quran" };

  const url = `${SITE}/blog/${post.slug}`;
  const image = blogPhotos[post.slug] ?? `${SITE}/og-image.png`;
  const description = post.excerpt;

  return {
    title: `${post.title} — Noor-ul-Quran Blog`,
    description,
    keywords: post.categories,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: "Noor-ul-Quran",
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
      creator: "@noorulquran",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  // JSON-LD Article schema for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: blogPhotos[post.slug] ? [blogPhotos[post.slug]] : [`${SITE}/og-image.png`],
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Noor-ul-Quran",
      logo: { "@type": "ImageObject", url: `${SITE}/apple-touch-icon.png` },
    },
    datePublished: post.updatedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${post.slug}` },
    keywords: post.categories.join(", "),
    articleSection: post.categories[0],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostClient slug={slug} />
    </>
  );
}
