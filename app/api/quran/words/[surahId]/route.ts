import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ surahId: string }> }
) {
  const { surahId } = await params;
  const id = parseInt(surahId, 10);
  if (isNaN(id) || id < 1 || id > 114) {
    return NextResponse.json({ error: "Invalid surah number" }, { status: 400 });
  }

  try {
    const url =
      `https://api.quran.com/api/v4/verses/by_chapter/${id}` +
      `?words=true&word_fields=text_uthmani,transliteration,translation,audio_url` +
      `&per_page=300&language=en`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error", status: res.status }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch word data" }, { status: 502 });
  }
}
