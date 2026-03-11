import type {
  Banner,
  Brand,
  Category,
  FilterConfig,
  HomepageData,
  NavigationData,
  Product,
  SiteSettings,
} from "@/types/ecommerce";

// Commerce data source boundary.
// Swap this from local JSON to ERP/API without changing UI-facing utilities.
export interface CommerceCatalogSource {
  getProducts(): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getBrands(): Promise<Brand[]>;
  getFilters(): Promise<FilterConfig>;
}

// Web content source boundary.
// These blocks usually stay CMS/JSON-managed even when product data moves to ERP.
export interface ContentSource {
  getNavigation(): Promise<NavigationData>;
  getHomepage(): Promise<HomepageData>;
  getBanners(): Promise<Banner[]>;
  getSiteSettings(): Promise<SiteSettings>;
}
