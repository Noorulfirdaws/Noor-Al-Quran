import type { NextConfig } from "next";

// Base headers applied to ALL routes. X-Frame-Options is added separately below
// so the embeddable /embed/* widgets can be framed by other sites.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), payment=(self)",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://images.pexels.com https://images.unsplash.com",
      // Allow Quran audio CDN + word-level audio + Pexels video
      "media-src 'self' blob: https://cdn.islamic.network https://audio.qurancdn.com https://videos.pexels.com https://*.pexels.com https://player.vimeo.com https://*.vimeocdn.com https://everyayah.com",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      // Allow Quran API calls from browser (word-by-word proxy fallback) + fonts
      "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://api.alquran.cloud https://api.quran.com https://cdn.islamic.network https://audio.qurancdn.com https://everyayah.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Common security headers everywhere.
      { source: "/(.*)", headers: securityHeaders },
      // Clickjacking protection for everything EXCEPT the embeddable widgets.
      {
        source: "/:path((?!embed).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      // /embed/* may be framed by any site.
      {
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ];
  },

  async rewrites() {
    return [];
  },
};

export default nextConfig;
