import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryCatalogPage from "@/components/category-catalog-page";
import { getAllCategories } from "@/lib/data";
import { getCategoryCatalogPageData } from "@/lib/category-page-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getAllCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryCatalogPageData(slug);

  if (!data) {
    return {};
  }

  return {
    title: `${data.category.seoTitle} - Items`,
    description: data.category.seoDescription,
    openGraph: {
      title: `${data.category.seoTitle} - Items`,
      description: data.category.seoDescription,
      images: [data.category.metaImage],
    },
  };
}

export default async function CategoryItemsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryCatalogPageData(slug);

  if (!data) {
    notFound();
  }

  return <CategoryCatalogPage {...data} view="items" />;
}
