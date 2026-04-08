import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return Response.json({ error: error.message });
  }

  for (let product of products) {
    const oldBest = Math.min(product.amazonPrice, product.flipkartPrice);

const changeAmazon = Math.floor(Math.random() * 50 - 25);
const changeFlipkart = Math.floor(Math.random() * 50 - 25);

const newAmazon = product.amazonPrice + changeAmazon;
const newFlipkart = product.flipkartPrice + changeFlipkart;

const newBest = Math.min(newAmazon, newFlipkart);

await supabase
  .from("products")
  .update({
    previousPrice: oldBest,
    amazonPrice: Math.max(100, newAmazon),
    flipkartPrice: Math.max(100, newFlipkart),
    lastUpdated: new Date().toLocaleTimeString(),
  })
  .eq("id", product.id);
  }

  return Response.json({ success: true });
}