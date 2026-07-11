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
  minPhotoCount: number;
  maxPhotoCount: number;
  photoUploadLabel: string | null;
  photoUploadDescription: string | null;
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
  requires_photo?: boolean;
  min_photo_count?: number | null;
  max_photo_count?: number | null;
  photo_upload_label?: string | null;
  photo_upload_description?: string | null;
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
    requiresPhoto: Boolean(row.requires_photo),
    minPhotoCount: Number(row.min_photo_count ?? 0),
    maxPhotoCount: Number(row.max_photo_count ?? 0),
    photoUploadLabel: row.photo_upload_label ?? null,
    photoUploadDescription: row.photo_upload_description ?? null,
    rating: 0,
    reviewCount: 0,
  };
}

function isMissingColumnError(error: { message?: string } | null | undefined): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return Boolean(message) && /does not exist|column .* not exist|missing column|could not find/i.test(message);
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

  if (error) return products;

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
  "id, slug, name, tagline, description, price_inr, compare_at_price_inr, main_image_url, details, requires_photo, min_photo_count, max_photo_count, photo_upload_label, photo_upload_description, categories(name)";
const legacyProductFields =
  "id, slug, name, tagline, description, price_inr, compare_at_price_inr, main_image_url, details, requires_photo, categories(name)";

async function fetchProductsWithFallback(selectFields: string, slug?: string) {
  const query = getSupabaseClient().from("products").select(selectFields);
  const response = slug
    ? await query.eq("slug", slug).maybeSingle()
    : await query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  if (!slug && response.error && isMissingColumnError(response.error)) {
    const fallback = await getSupabaseClient()
      .from("products")
      .select(legacyProductFields)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    return fallback;
  }

  if (slug && response.error && isMissingColumnError(response.error)) {
    const fallback = await getSupabaseClient()
      .from("products")
      .select(legacyProductFields)
      .eq("slug", slug)
      .maybeSingle();
    return fallback;
  }

  return response;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await fetchProductsWithFallback(productFields);

  if (error) throw error;
  const products = (data as ProductRow[]).map(toProduct);
  return hydrateProductReviews(products);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await fetchProductsWithFallback(productFields, slug);

  if (error) throw error;
  if (!data) return null;
  const [product] = await hydrateProductReviews([toProduct(data as ProductRow)]);
  return product ?? null;
}
