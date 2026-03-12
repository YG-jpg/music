"use client";

import { startTransition, useDeferredValue, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { HomeFooter, HomeHeader } from "@/components/home-shell";
import {
  Heart,
  Home,
  Mail,
  Search,
  Star,
  Truck,
  User,
} from "lucide-react";
import {
  articles,
  benefits,
  brands,
  categories,
  content,
  dealProducts,
  featuredProducts,
  type Locale,
  type Product,
} from "@/lib/storefront-data";

const heroImage =
  "https://images.unsplash.com/photo-1763889594062-04a75c7cb821?auto=format&fit=crop&w=1600&q=80";

const categoryHrefById: Record<string, string> = {
  guitars: "/categories/guitars",
  keys: "/categories/keyboards",
  drums: "/categories/drums",
  studio: "/categories/studio-recording",
  dj: "/categories/dj-equipment",
  live: "/categories/pa-live-sound",
  accessories: "/categories/accessories",
  deals: "/categories",
};

function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatCount(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-US").format(value);
}

export default function Storefront() {
  const [locale, setLocale] = useState<Locale>("bg");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const copy = content[locale];
  const normalizedQuery = deferredSearch.trim().toLocaleLowerCase();

  const matches = (value: string) => value.toLocaleLowerCase().includes(normalizedQuery);

  const visibleCategories = categories.filter((category) =>
    [category.label.bg, category.label.en].some(matches),
  );

  const filterProducts = (items: Product[]) =>
    items.filter((product) => [product.brand, product.name.bg, product.name.en].some(matches));

  const visibleDeals = filterProducts(dealProducts);
  const visibleFeatured = filterProducts(featuredProducts);

  return (
    <div className="home-page min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <HomeHeader
        locale={locale}
        onLocaleToggle={() =>
          startTransition(() => setLocale((current) => (current === "bg" ? "en" : "bg")))
        }
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt="Music instruments"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 mx-auto flex min-h-[460px] max-w-7xl items-center px-4 py-16 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-7xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-6 text-lg text-gray-200 md:text-2xl">{copy.heroText}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-8 py-4 text-lg font-medium text-white transition hover:bg-[var(--primary-hover)]"
                >
                  {copy.heroPrimary}
                </a>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-medium text-white transition hover:bg-white hover:text-black"
                >
                  {copy.heroSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">{copy.categoriesTitle}</h2>
              <p className="mt-2 text-[var(--gray-600)]">{copy.categoriesText}</p>
            </div>
            <Link href="/categories" className="text-sm font-semibold text-[var(--primary)]">
              Виж категориите
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={categoryHrefById[category.id] ?? "/categories"}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--gray-100)]">
                  <Image
                    src={category.image}
                    alt={category.label[locale]}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold">{category.label[locale]}</h3>
                  <p className="mt-1 text-sm text-[var(--gray-500)]">
                    {formatCount(category.itemCount, locale)} {copy.productsLabel}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[var(--gray-900)] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">{copy.dealsTitle}</h2>
                <p className="mt-2 text-[var(--blue-200)]">{copy.dealsText}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {visibleDeals.map((product) => (
                <ProductCard
                  key={product.id}
                  locale={locale}
                  product={product}
                  cta={copy.addToCart}
                  inStockLabel={copy.stock}
                  outOfStockLabel={copy.outOfStock}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-bold">{copy.featuredTitle}</h2>
            <Link href="/categories" className="text-sm font-semibold text-[var(--primary)]">
              {copy.featuredCta}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visibleFeatured.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                product={product}
                cta={copy.addToCart}
                inStockLabel={copy.stock}
                outOfStockLabel={copy.outOfStock}
              />
            ))}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-bold">{copy.brandsTitle}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {brands.map((brand) => (
                <div
                  key={brand}
                  className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--gray-50)] p-5 font-semibold text-[var(--gray-700)]"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold">{copy.benefitsTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="rounded-2xl bg-white p-8 text-center shadow-[var(--shadow-card)]"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--primary)]">
                  {benefit.icon === "truck" ? (
                    <Truck className="h-8 w-8" />
                  ) : benefit.icon === "shield" ? (
                    <User className="h-8 w-8" />
                  ) : (
                    <Mail className="h-8 w-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold">{benefit.title[locale]}</h3>
                <p className="mt-3 text-[var(--gray-600)]">{benefit.text[locale]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-bold">{copy.editorialTitle}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id}>
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-[var(--gray-100)]">
                    <Image
                      src={article.image}
                      alt={article.title[locale]}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{article.title[locale]}</h3>
                  <p className="mt-2 text-sm text-[var(--gray-600)]">{article.text[locale]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <HomeFooter locale={locale} />

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-white md:hidden">
        <nav className="grid h-16 grid-cols-4">
          <BottomIcon icon={<Home className="h-5 w-5" />} label={copy.mobileNav.home} active />
          <BottomIcon icon={<Search className="h-5 w-5" />} label={copy.mobileNav.search} />
          <BottomIcon icon={<Heart className="h-5 w-5" />} label={copy.mobileNav.saved} />
          <BottomIcon icon={<User className="h-5 w-5" />} label={copy.mobileNav.profile} />
        </nav>
      </div>
    </div>
  );
}

function ProductCard({
  locale,
  product,
  cta,
  inStockLabel,
  outOfStockLabel,
}: {
  locale: Locale;
  product: Product;
  cta: string;
  inStockLabel: string;
  outOfStockLabel: string;
}) {
  const { addItem } = useCart();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="relative aspect-square overflow-hidden bg-[var(--gray-100)]">
        <Image
          src={product.image}
          alt={product.name[locale]}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="text-sm text-[var(--gray-500)]">{product.brand}</div>
        <h3 className="mt-1 min-h-12 line-clamp-2 font-medium">{product.name[locale]}</h3>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`${product.id}-${index}`}
                className={`h-4 w-4 ${
                  index < Math.floor(product.rating)
                    ? "fill-[var(--warning)] text-[var(--warning)]"
                    : "text-[var(--gray-300)]"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-[var(--gray-500)]">({product.reviews})</span>
        </div>
        <div className="mt-3">
          {product.originalPrice ? (
            <div className="text-sm text-[var(--gray-500)] line-through">
              {formatCurrency(product.originalPrice, locale)}
            </div>
          ) : null}
          <div className="text-2xl font-semibold">{formatCurrency(product.price, locale)}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            addItem({
              id: product.id,
              slug: product.id,
              name: product.name[locale],
              brand: product.brand,
              image: product.image,
              price: product.price,
              maxQuantity: 99,
              externalUrl: product.href,
            })
          }
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
        >
          {cta}
        </button>
        {product.href ? (
          <a
            href={product.href}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
          >
            Source
          </a>
        ) : null}
        <div
          className={`mt-2 text-sm ${
            product.inStock ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}
        >
          {product.inStock ? inStockLabel : outOfStockLabel}
        </div>
      </div>
    </div>
  );
}

function BottomIcon({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium ${
        active ? "text-[var(--primary)]" : "text-[var(--gray-500)]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
