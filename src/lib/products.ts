import { getSupabaseClient } from "@/lib/supabase";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  category: string;
  image: string;
  description: string;
  details: string[];
  requiresPhoto: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  main_image_url: string | null;
  details: unknown;
  requires_photo: boolean;
  categories: { name: string } | null;
};

function toDetails(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((detail): detail is string => typeof detail === "string")
    : [];
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "Made with care",
    price: row.price_inr,
    compareAt: row.compare_at_price_inr ?? undefined,
    category: row.categories?.name ?? "Collection",
    image: row.main_image_url ?? "/favicon.ico",
    description: row.description,
    details: toDetails(row.details),
    requiresPhoto: row.requires_photo,
    rating: 0,
    reviewCount: 0,
  };
}

type ReviewStats = {
  rating: number;
  reviewCount: number;
};

async function hydrateProductReviews(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;

  const { data, error } = await getSupabaseClient()
    .from("reviews")
    .select("product_id, rating")
    .eq("status", "published")
    .in("product_id", products.map((product) => product.id));

  if (error) throw error;

  const statsByProductId = new Map<string, ReviewStats>();
  for (const review of (data ?? []) as { product_id: string; rating: number }[]) {
    const current = statsByProductId.get(review.product_id) ?? { rating: 0, reviewCount: 0 };
    statsByProductId.set(review.product_id, {
      rating: current.rating + review.rating,
      reviewCount: current.reviewCount + 1,
    });
  }

  return products.map((product) => {
    const stats = statsByProductId.get(product.id);
    if (!stats || stats.reviewCount === 0) return product;
    return {
      ...product,
      rating: Number((stats.rating / stats.reviewCount).toFixed(1)),
      reviewCount: stats.reviewCount,
    };
  });
}

const productFields =
  "id, slug, name, tagline, description, price_inr, compare_at_price_inr, main_image_url, details, requires_photo, categories(name)";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(productFields)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const products = (data as ProductRow[]).map(toProduct);
  return hydrateProductReviews(products);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(productFields)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const [product] = await hydrateProductReviews([toProduct(data as ProductRow)]);
  return product ?? null;
}
