import { NextRequest, NextResponse } from "next/server";

/**
 * Audio proxy — fetches Quran audio from external CDN and streams it back.
 * This bypasses any CDN blocking or CORS issues the browser might have.
 *
 * Usage: /api/audio?url=https://everyayah.com/data/Alafasy_128kbps/001001.mp3
 */

// Allowlist: only proxy these hostnames — never proxy arbitrary URLs
const ALLOWED_HOSTS = new Set([
  "everyayah.com",
  "cdn.islamic.network",
  "audio.qurancdn.com",
  "verses.quran.com",
]);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 NoorUlQuran/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error ${upstream.status}`, { status: 502 });
    }

    const body = upstream.body;
    if (!body) {
      return new NextResponse("No body from upstream", { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
        "Content-Length": upstream.headers.get("Content-Length") ?? "",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[audio proxy]", err);
    return new NextResponse("Failed to fetch audio", { status: 502 });
  }
}
