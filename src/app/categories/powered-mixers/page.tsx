import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryCatalogPage from "@/components/category-catalog-page";
import { getCategoryBySlug } from "@/lib/data";
import { getCategoryCatalogPageData } from "@/lib/category-page-data";

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
  const data = await getCategoryCatalogPageData("powered-mixers");

  if (!data) {
    notFound();
  }

  return <CategoryCatalogPage {...data} />;
}
