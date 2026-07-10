import productFrame from "@/assets/product-frame.jpg";
import productHeart from "@/assets/product-heart.jpg";
import productLovebook from "@/assets/product-lovebook.jpg";
import productHamper from "@/assets/product-hamper.jpg";
import productBranding from "@/assets/product-branding.jpg";
import productKeychain from "@/assets/product-keychain.jpg";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  category: string;
  image: string;
  gallery?: string[];
  description: string;
  details: string[];
  badge?: string;
};

export const products: Product[] = [
  {
    slug: "signature-photo-frame",
    name: "Signature Photo Frame",
    tagline: "Museum-grade acrylic, hand-finished",
    price: 499,
    compareAt: 799,
    category: "Personalized Gifts",
    image: productFrame,
    description:
      "A quiet, contemporary frame designed to hold a single moment with reverence. Cut, polished, and finished by hand in our Mumbai studio.",
    details: ["Premium acrylic + oak", "Custom photo print", "Gift-ready packaging", "Made-to-order in 3 days"],
    badge: "Best Seller",
  },
  {
    slug: "heart-keepsake",
    name: "Heart Keepsake",
    tagline: "Etched acrylic love portrait",
    price: 349,
    category: "Personalized Gifts",
    image: productHeart,
    description: "A translucent heart, engraved with your story. Slips into a pocket, sits in a palm, keeps a memory close.",
    details: ["4mm optical acrylic", "Laser-etched artwork", "Includes gift sleeve"],
  },
  {
    slug: "love-book",
    name: "The Love Book",
    tagline: "10 pages of your story, hand-bound",
    price: 599,
    category: "Personalized Gifts",
    image: productLovebook,
    description: "A miniature book of your favorite memories, illustrated and bound like a keepsake heirloom.",
    details: ["Hand-bound, 10 pages", "Custom illustrations", "Linen cover"],
    badge: "New",
  },
  {
    slug: "keepsake-hamper",
    name: "Keepsake Hamper",
    tagline: "A curated box of memories",
    price: 1999,
    compareAt: 2499,
    category: "Gift Hampers",
    image: productHamper,
    description: "Five personalized pieces, arranged with intention. Ribbon-tied and ready to travel.",
    details: ["5 curated items", "Silk-lined box", "Handwritten note"],
  },
  {
    slug: "brand-identity",
    name: "Brand Identity System",
    tagline: "Logo, marks, palette, guidelines",
    price: 24999,
    category: "Branding",
    image: productBranding,
    description: "A full identity built from first principles. Wordmarks, monograms, color, typography, guidelines.",
    details: ["Discovery + strategy", "3 concept routes", "Full guideline PDF", "Print & digital assets"],
  },
  {
    slug: "sparkling-keychain",
    name: "Sparkling Keychain",
    tagline: "Miniature, cast in brass",
    price: 249,
    compareAt: 499,
    category: "Accessories",
    image: productKeychain,
    description: "A tiny, luminous object. Weighty, precise, and impossible to ignore on a set of keys.",
    details: ["Solid brass", "Hand-polished", "Gift box included"],
  },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
