import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah", {
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch surah list" }, { status: 502 });
  }
}
