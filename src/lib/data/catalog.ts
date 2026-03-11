import type {
  AvailabilityStatus,
  Brand,
  Category,
  FilterConfig,
  Product,
  SortOptionId,
} from "@/types/ecommerce";

import type { CommerceCatalogSource } from "./contracts";
import { localCommerceCatalogSource } from "./local-source";

export interface ProductQueryOptions {
  activeOnly?: boolean;
  categorySlug?: string;
  includeDescendants?: boolean;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: AvailabilityStatus[];
  featuredOnly?: boolean;
  newArrivalOnly?: boolean;
  bestsellerOnly?: boolean;
  sortBy?: SortOptionId;
  limit?: number;
}

let commerceCatalogSource: CommerceCatalogSource = localCommerceCatalogSource;

export function configureCommerceCatalogSource(source: CommerceCatalogSource) {
  commerceCatalogSource = source;
}

export async function getAllProducts(
  options: Pick<ProductQueryOptions, "activeOnly"> = {},
): Promise<Product[]> {
  const { activeOnly = true } = options;
  const products = await commerceCatalogSource.getProducts();

  return activeOnly ? products.filter((product) => product.active) : products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts({ activeOnly: false });

  return products.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  const featured = products.filter((product) => product.featured);

  return sortProducts(featured, "most-popular").slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);
  const currentProduct = products.find((product) => product.id === productId);

  if (!currentProduct) {
    return [];
  }

  const siblingCategoryIds = collectDescendantCategoryIds(
    categories,
    currentProduct.baseCategoryId,
  );

  return products
    .filter((product) => product.id !== currentProduct.id)
    .map((product) => ({
      product,
      score:
        Number(product.brandId === currentProduct.brandId) * 20 +
        product.categoryIds.filter((categoryId) => siblingCategoryIds.includes(categoryId)).length *
          10 +
        product.tags.filter((tag) => currentProduct.tags.includes(tag)).length * 3 +
        Number(product.featured) +
        Number(product.bestseller),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || comparePopularity(left.product, right.product),
    )
    .slice(0, limit)
    .map((entry) => entry.product);
}

export async function getAllCategories(): Promise<Category[]> {
  return commerceCatalogSource.getCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();

  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getAllBrands(): Promise<Brand[]> {
  return commerceCatalogSource.getBrands();
}

export const getBrands = getAllBrands;

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const brands = await getAllBrands();

  return brands.find((brand) => brand.slug === slug) ?? null;
}

export async function getFilterConfig(): Promise<FilterConfig> {
  return commerceCatalogSource.getFilters();
}

export async function getProductsByCategory(
  slug: string,
  options: Omit<ProductQueryOptions, "categorySlug"> = {},
): Promise<Product[]> {
  return queryProducts({
    ...options,
    categorySlug: slug,
  });
}

export async function queryProducts(
  options: ProductQueryOptions = {},
): Promise<Product[]> {
  const {
    activeOnly = true,
    categorySlug,
    includeDescendants = true,
    brandSlugs,
    minPrice,
    maxPrice,
    minRating,
    availability,
    featuredOnly = false,
    newArrivalOnly = false,
    bestsellerOnly = false,
    sortBy = "most-popular",
    limit,
  } = options;

  const [products, categories, brands] = await Promise.all([
    getAllProducts({ activeOnly }),
    getAllCategories(),
    getAllBrands(),
  ]);

  let result = [...products];

  if (categorySlug) {
    const category = categories.find((item) => item.slug === categorySlug);

    if (!category) {
      return [];
    }

    const categoryIds = includeDescendants
      ? collectDescendantCategoryIds(categories, category.id)
      : [category.id];

    result = result.filter((product) =>
      product.categoryIds.some((categoryId) => categoryIds.includes(categoryId)),
    );
  }

  if (brandSlugs?.length) {
    const brandIds = new Set(
      brands
        .filter((brand) => brandSlugs.includes(brand.slug))
        .map((brand) => brand.id),
    );
    result = result.filter((product) => brandIds.has(product.brandId));
  }

  if (typeof minPrice === "number") {
    result = result.filter((product) => product.price >= minPrice);
  }

  if (typeof maxPrice === "number") {
    result = result.filter((product) => product.price <= maxPrice);
  }

  if (typeof minRating === "number") {
    result = result.filter((product) => product.rating >= minRating);
  }

  if (availability?.length) {
    result = result.filter((product) => availability.includes(product.availability));
  }

  if (featuredOnly) {
    result = result.filter((product) => product.featured);
  }

  if (newArrivalOnly) {
    result = result.filter((product) => product.newArrival);
  }

  if (bestsellerOnly) {
    result = result.filter((product) => product.bestseller);
  }

  const sorted = sortProducts(result, sortBy);

  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function sortProducts(
  products: Product[],
  sortBy: SortOptionId = "most-popular",
): Product[] {
  const sorted = [...products];

  sorted.sort((left, right) => {
    switch (sortBy) {
      case "newest":
        return compareBooleans(right.newArrival, left.newArrival) || comparePopularity(left, right);
      case "price-low-to-high":
        return left.price - right.price || comparePopularity(left, right);
      case "price-high-to-low":
        return right.price - left.price || comparePopularity(left, right);
      case "best-rated":
        return right.rating - left.rating || right.reviewCount - left.reviewCount;
      case "most-popular":
      default:
        return comparePopularity(left, right);
    }
  });

  return sorted;
}

function comparePopularity(left: Product, right: Product) {
  const leftScore = Number(left.bestseller) * 1000 + left.reviewCount * 10 + left.rating;
  const rightScore =
    Number(right.bestseller) * 1000 + right.reviewCount * 10 + right.rating;

  return rightScore - leftScore;
}

function compareBooleans(left: boolean, right: boolean) {
  return Number(left) - Number(right);
}

function collectDescendantCategoryIds(
  categories: Category[],
  rootCategoryId: string,
): string[] {
  const categoryIds = new Set<string>([rootCategoryId]);
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId) {
      continue;
    }

    categories
      .filter((category) => category.parentId === currentId)
      .forEach((category) => {
        if (categoryIds.has(category.id)) {
          return;
        }

        categoryIds.add(category.id);
        queue.push(category.id);
      });
  }

  return [...categoryIds];
}
