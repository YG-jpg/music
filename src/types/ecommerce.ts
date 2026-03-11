export type AvailabilityStatus =
  | "in_stock"
  | "low_stock"
  | "preorder"
  | "out_of_stock"
  | "discontinued";

export type SortOptionId =
  | "most-popular"
  | "newest"
  | "price-low-to-high"
  | "price-high-to-low"
  | "best-rated";

export interface SeoFields {
  seoTitle: string;
  seoDescription: string;
  metaImage: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  type: "main" | "gallery" | "detail";
}

export interface ProductSpec {
  group: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number | null;
  stock: number;
  active: boolean;
}

export interface ShippingInfo {
  weightKg: number;
  oversize: boolean;
  freeShippingEligible: boolean;
  estimatedDispatchDays: number;
  carrierGroup: string;
}

export interface StockInfo {
  quantity: number;
  warehouseCode: string;
  incomingQuantity: number;
  nextRestockDate: string | null;
  lowStockThreshold: number;
}

// ERP-like commerce entity. Later this should come from ERP/stock/translation API.
export interface Product extends SeoFields {
  id: string;
  sku: string;
  slug: string;
  externalUrl?: string;
  name: string;
  shortDescription: string;
  description: string;
  brandId: string;
  categoryIds: string[];
  baseCategoryId: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  stock: StockInfo;
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  thumbnails: string[];
  tags: string[];
  badges: string[];
  specs: ProductSpec[];
  variants: ProductVariant[];
  shipping: ShippingInfo;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  active: boolean;
}

// ERP-like taxonomy entity. Later this should come from ERP/category mapping + translation API.
export interface Category extends SeoFields {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  parentId: string | null;
  level: number;
  featured: boolean;
}

// ERP-like master data. Usually synced from PIM/ERP, but frontend can cache locally.
export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description: string;
  featured: boolean;
}

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  categorySlug?: string;
  external?: boolean;
}

export interface MegaMenuColumn {
  id: string;
  title: string;
  items: NavigationLink[];
}

export interface MegaMenuGroup {
  id: string;
  title: string;
  columns: MegaMenuColumn[];
  featuredCard: {
    title: string;
    description: string;
    href: string;
    image: string;
  };
}

export interface MainMenuItem extends NavigationLink {
  megaMenuGroupId?: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  items: NavigationLink[];
}

// Web-managed presentation content. This can stay JSON/CMS managed even after ERP rollout.
export interface NavigationData {
  mainMenu: MainMenuItem[];
  megaMenuGroups: MegaMenuGroup[];
  footerColumns: FooterColumn[];
}

export interface SectionCta {
  label: string;
  href: string;
}

export interface HomepageHero extends SeoFields {
  id: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  backgroundImage: string;
  primaryCta: SectionCta;
  secondaryCta: SectionCta;
}

export interface HomepageReferenceSection extends SeoFields {
  id: string;
  title: string;
  subtitle: string;
  categoryIds?: string[];
  productIds?: string[];
  brandIds?: string[];
  cta?: SectionCta;
}

export interface EditorialBlock extends SeoFields {
  id: string;
  title: string;
  description: string;
  image: string;
  cta: SectionCta;
}

export interface GuideArticle extends SeoFields {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  category: string;
}

export interface NewsletterBlock extends SeoFields {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
}

// Web-managed homepage content.
export interface HomepageData {
  hero: HomepageHero;
  featuredCategories: HomepageReferenceSection;
  topDeals: HomepageReferenceSection;
  featuredProducts: HomepageReferenceSection;
  brandsStrip: HomepageReferenceSection;
  editorialSections: EditorialBlock[];
  guides: GuideArticle[];
  newsletterBlock: NewsletterBlock;
}

export interface Banner extends SeoFields {
  id: string;
  placement: "top-strip" | "homepage-inline" | "category-highlight";
  title: string;
  subtitle: string;
  image: string;
  cta: SectionCta;
  active: boolean;
  startAt: string;
  endAt: string | null;
}

export interface PriceRangeFilter {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export interface BrandFilterOption {
  brandId: string;
  label: string;
}

export interface RatingFilterOption {
  id: string;
  label: string;
  minRating: number;
}

export interface AvailabilityFilterOption {
  id: string;
  label: string;
  values: AvailabilityStatus[];
}

export interface SortOption {
  id: SortOptionId;
  label: string;
}

export interface FilterConfig {
  priceRanges: PriceRangeFilter[];
  brands: BrandFilterOption[];
  rating: RatingFilterOption[];
  availability: AvailabilityFilterOption[];
  sortOptions: SortOption[];
}

export interface SiteSettings extends SeoFields {
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  supportedLocales: string[];
  defaultCurrency: string;
  supportedCurrencies: string[];
  contact: {
    phone: string;
    email: string;
    supportHours: string;
  };
  shipping: {
    freeShippingThreshold: number;
    freeShippingMessage: string;
    dispatchMessage: string;
  };
  socialLinks: Array<{
    platform: string;
    href: string;
  }>;
}
