import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PoweredMixersPage from "@/components/powered-mixers-page";
import {
  getAllBrands,
  getCategoryBySlug,
  getFilterConfig,
  getProductsByCategory,
} from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const category = await getCategoryBySlug("powered-mixers");

  if (!category) {
    return {};
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      images: [category.metaImage],
    },
  };
}

export default async function PoweredMixersCategoryPage() {
  const [category, products, brands, filterConfig] = await Promise.all([
    getCategoryBySlug("powered-mixers"),
    getProductsByCategory("powered-mixers", {
      includeDescendants: true,
      sortBy: "most-popular",
    }),
    getAllBrands(),
    getFilterConfig(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <PoweredMixersPage
      products={products}
      brands={brands}
      filterConfig={filterConfig}
    />
  );
}
