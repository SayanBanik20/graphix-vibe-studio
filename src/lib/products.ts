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
  requiresPhoto?: boolean;
  rating: number;
  reviewCount: number;
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
    details: [
      "Premium acrylic + oak",
      "Custom photo print",
      "Gift-ready packaging",
      "Made-to-order in 3 days",
    ],
    badge: "Best Seller",
    requiresPhoto: true,
    rating: 4.9,
    reviewCount: 42,
  },
  {
    slug: "heart-keepsake",
    name: "Heart Keepsake",
    tagline: "Etched acrylic love portrait",
    price: 349,
    category: "Personalized Gifts",
    image: productHeart,
    description:
      "A translucent heart, engraved with your story. Slips into a pocket, sits in a palm, keeps a memory close.",
    details: ["4mm optical acrylic", "Laser-etched artwork", "Includes gift sleeve"],
    requiresPhoto: true,
    rating: 4.8,
    reviewCount: 28,
  },
  {
    slug: "love-book",
    name: "The Love Book",
    tagline: "10 pages of your story, hand-bound",
    price: 599,
    category: "Personalized Gifts",
    image: productLovebook,
    description:
      "A miniature book of your favorite memories, illustrated and bound like a keepsake heirloom.",
    details: ["Hand-bound, 10 pages", "Custom illustrations", "Linen cover"],
    badge: "New",
    requiresPhoto: true,
    rating: 4.9,
    reviewCount: 17,
  },
  {
    slug: "keepsake-hamper",
    name: "Keepsake Hamper",
    tagline: "A curated box of memories",
    price: 1999,
    compareAt: 2499,
    category: "Gift Hampers",
    image: productHamper,
    description:
      "Five personalized pieces, arranged with intention. Ribbon-tied and ready to travel.",
    details: ["5 curated items", "Silk-lined box", "Handwritten note"],
    requiresPhoto: true,
    rating: 5,
    reviewCount: 19,
  },
  {
    slug: "brand-identity",
    name: "Brand Identity System",
    tagline: "Logo, marks, palette, guidelines",
    price: 24999,
    category: "Branding",
    image: productBranding,
    description:
      "A full identity built from first principles. Wordmarks, monograms, color, typography, guidelines.",
    details: [
      "Discovery + strategy",
      "3 concept routes",
      "Full guideline PDF",
      "Print & digital assets",
    ],
    rating: 5,
    reviewCount: 11,
  },
  {
    slug: "sparkling-keychain",
    name: "Sparkling Keychain",
    tagline: "Miniature, cast in brass",
    price: 249,
    compareAt: 499,
    category: "Accessories",
    image: productKeychain,
    description:
      "A tiny, luminous object. Weighty, precise, and impossible to ignore on a set of keys.",
    details: ["Solid brass", "Hand-polished", "Gift box included"],
    rating: 4.7,
    reviewCount: 14,
  },
  {
    slug: "memory-strip",
    name: "Memory Photo Strip",
    tagline: "Four frames, one little story",
    price: 199,
    category: "Personalized Gifts",
    image: productLovebook,
    description:
      "A compact sequence of favorite moments, printed and finished for everyday nostalgia.",
    details: ["Four-photo layout", "Matte photo finish", "Gift sleeve included"],
    requiresPhoto: true,
    rating: 4.8,
    reviewCount: 23,
  },
  {
    slug: "mini-polaroid-set",
    name: "Mini Polaroid Set",
    tagline: "A pocketful of bright memories",
    price: 299,
    category: "Personalized Gifts",
    image: productHeart,
    description: "A set of miniature photo prints made for notes, desks, and small surprises.",
    details: ["Set of 12 prints", "Custom photo upload", "Soft-touch finish"],
    requiresPhoto: true,
    rating: 4.7,
    reviewCount: 31,
  },
  {
    slug: "celebration-box",
    name: "Celebration Box",
    tagline: "A gift box designed around them",
    price: 1499,
    category: "Gift Hampers",
    image: productHamper,
    description:
      "A joyful made-to-order box with personalized details for birthdays and milestones.",
    details: ["Custom message card", "Premium wrapping", "Made in 3 days"],
    requiresPhoto: true,
    rating: 4.9,
    reviewCount: 16,
  },
  {
    slug: "monogram-keyring",
    name: "Monogram Keyring",
    tagline: "Personalized brass, everyday useful",
    price: 399,
    category: "Accessories",
    image: productKeychain,
    description: "A polished brass keyring personalized with a name or initials.",
    details: ["Solid brass", "Custom engraving", "Gift box included"],
    rating: 4.6,
    reviewCount: 12,
  },
  {
    slug: "wedding-stationery",
    name: "Wedding Stationery Suite",
    tagline: "A considered first impression",
    price: 8999,
    category: "Branding",
    image: productBranding,
    description: "A cohesive invitation and stationery system for your celebration.",
    details: ["Invitation suite", "Custom monogram", "Print-ready artwork"],
    rating: 5,
    reviewCount: 8,
  },
  {
    slug: "desk-photo-block",
    name: "Desk Photo Block",
    tagline: "A solid little reminder",
    price: 549,
    category: "Personalized Gifts",
    image: productFrame,
    description: "A freestanding photo block that gives one treasured image a place on the desk.",
    details: ["Premium acrylic", "Custom photo print", "Ready to display"],
    requiresPhoto: true,
    rating: 4.8,
    reviewCount: 21,
  },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
