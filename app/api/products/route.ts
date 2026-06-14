import { NextRequest, NextResponse } from "next/server";
import { products } from "../../data/products";

/**
 * GET /api/products
 * Returns the digital-products catalog. Supports optional filtering:
 *   ?category=Islamic%20Legacy | Worship%20Trackers
 *   ?type=Book | Tracker | Calendar | Checklist | Log
 *   ?featured=true
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const featured = searchParams.get("featured");

  let list = products;
  if (category && category !== "All") list = list.filter((p) => p.category === category);
  if (type) list = list.filter((p) => p.type === type);
  if (featured === "true") list = list.filter((p) => p.featured);

  return NextResponse.json(
    { count: list.length, products: list },
    { headers: { "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } }
  );
}
