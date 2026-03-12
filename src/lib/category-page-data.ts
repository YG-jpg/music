import { getAllBrands, getAllCategories, getAllProducts, getFilterConfig } from "@/lib/data";
import type { Brand, Category, FilterConfig, Product } from "@/types/ecommerce";

export interface CategoryBrowseItem extends Category {
  productCount: number;
}

export interface CategoryCatalogPageData {
  category: Category;
  parentCategory: Category | null;
  childCategories: CategoryBrowseItem[];
  siblingCategories: CategoryBrowseItem[];
  products: Product[];
  brands: Brand[];
  filterConfig: FilterConfig;
}

export async function getCategoryCatalogPageData(
  slug: string,
): Promise<CategoryCatalogPageData | null> {
  const [allProducts, categories, brands, filterConfig] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllBrands(),
    getFilterConfig(),
  ]);

  const category = categories.find((entry) => entry.slug === slug) ?? null;

  if (!category) {
    return null;
  }

  const categoryIds = collectDescendantCategoryIds(categories, category.id);
  const products = allProducts.filter((product) =>
    product.categoryIds.some((categoryId) => categoryIds.includes(categoryId)),
  );
  const parentCategory =
    (category.parentId
      ? categories.find((entry) => entry.id === category.parentId)
      : null) ?? null;

  return {
    category,
    parentCategory,
    childCategories: buildBrowseItems(categories, allProducts, category.id),
    siblingCategories: buildBrowseItems(
      categories,
      allProducts,
      category.parentId,
      category.id,
    ),
    products,
    brands,
    filterConfig,
  };
}

function buildBrowseItems(
  categories: Category[],
  products: Product[],
  parentId: string | null,
  excludeId?: string,
) {
  return categories
    .filter((category) => category.parentId === parentId && category.id !== excludeId)
    .map((category) => ({
      ...category,
      productCount: products.filter((product) =>
        product.categoryIds.some((categoryId) =>
          collectDescendantCategoryIds(categories, category.id).includes(categoryId),
        ),
      ).length,
    }))
    .filter((category) => category.productCount > 0)
    .sort((left, right) => {
      return (
        Number(right.featured) - Number(left.featured) ||
        right.productCount - left.productCount ||
        left.name.localeCompare(right.name)
      );
    });
}

function collectDescendantCategoryIds(categories: Category[], rootCategoryId: string) {
  const categoryIds = new Set<string>([rootCategoryId]);
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId) {
      continue;
    }

    for (const category of categories) {
      if (category.parentId !== currentId || categoryIds.has(category.id)) {
        continue;
      }

      categoryIds.add(category.id);
      queue.push(category.id);
    }
  }

  return [...categoryIds];
}
