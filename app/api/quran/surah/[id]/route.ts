import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const surahId = parseInt(id, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return NextResponse.json({ error: "Invalid surah number" }, { status: 400 });
  }

  try {
    const url =
      `https://api.alquran.cloud/v1/surah/${surahId}` +
      `/editions/quran-uthmani,en.transliteration,en.sahih`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch surah" }, { status: 502 });
  }
}
