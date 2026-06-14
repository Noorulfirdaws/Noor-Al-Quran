import { NextResponse } from "next/server";
import { getProduct } from "../../../data/products";

/**
 * GET /api/products/[slug]
 * Returns a single digital product by slug.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(
    { product },
    { headers: { "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } }
  );
}
