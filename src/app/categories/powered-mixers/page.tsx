import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data";

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
  redirect("/categories/powered-mixers/items");
}
