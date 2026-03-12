import bannersData from "@/data/banners.json";
import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";
import filtersData from "@/data/filters.json";
import homepageData from "@/data/homepage.json";
import mockProductsData from "@/data/mock-products.json";
import navigationData from "@/data/navigation.json";
import productsData from "@/data/products.json";
import siteSettingsData from "@/data/site-settings.json";

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

import type { CommerceCatalogSource, ContentSource } from "./contracts";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Current local JSON implementation.
// Later this file can be replaced with fetch-based ERP/CMS adapters.
export const localCommerceCatalogSource: CommerceCatalogSource = {
  async getProducts() {
    const baseProducts = productsData as Product[];
    const mockProducts = mockProductsData as Product[];

    return cloneJson([...baseProducts, ...mockProducts]);
  },
  async getCategories() {
    return cloneJson(categoriesData as Category[]);
  },
  async getBrands() {
    return cloneJson(brandsData as Brand[]);
  },
  async getFilters() {
    return cloneJson(filtersData as FilterConfig);
  },
};

export const localContentSource: ContentSource = {
  async getNavigation() {
    return cloneJson(navigationData as NavigationData);
  },
  async getHomepage() {
    return cloneJson(homepageData as HomepageData);
  },
  async getBanners() {
    return cloneJson(bannersData as Banner[]);
  },
  async getSiteSettings() {
    return cloneJson(siteSettingsData as SiteSettings);
  },
};
