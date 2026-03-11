"use client";

import { startTransition, useDeferredValue, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CartButton, useCart } from "@/components/cart-provider";
import {
  Globe,
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
  footerGroups,
  type Locale,
  type Product,
} from "@/lib/storefront-data";

const heroImage =
  "https://images.unsplash.com/photo-1763889594062-04a75c7cb821?auto=format&fit=crop&w=1600&q=80";

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
    items.filter((product) =>
      [product.brand, product.name.bg, product.name.en].some(matches),
    );

  const visibleDeals = filterProducts(dealProducts);
  const visibleFeatured = filterProducts(featuredProducts);

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="hidden bg-[var(--gray-900)] py-2 text-white md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" />
              <span>{copy.shippingMessage}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>EUR</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  startTransition(() =>
                    setLocale((current) => (current === "bg" ? "en" : "bg")),
                  )
                }
                className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
              >
                {copy.localeSwitch}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-black italic text-white">
                M
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">MusicWorld</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--primary)]">
                  .bg
                </div>
              </div>
            </Link>

            <div className="hidden max-w-2xl flex-1 md:block">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={copy.searchPlaceholder}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() =>
                  startTransition(() =>
                    setLocale((current) => (current === "bg" ? "en" : "bg")),
                  )
                }
                className="rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-semibold md:hidden"
              >
                {copy.localeSwitch}
              </button>
              <HeaderIcon icon={<Heart className="h-5 w-5" />} />
              <HeaderIcon icon={<User className="h-5 w-5" />} />
              <CartButton />
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          <nav className="mt-4 hidden flex-wrap items-center justify-center gap-3 border-t border-[var(--border)] pt-4 md:flex">
            {categories.map((category) => (
              <Link
                key={category.id}
                href="/categories"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--gray-700)] transition hover:text-[var(--primary)]"
              >
                {category.label[locale]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

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
                href="/categories"
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
              <div key={benefit.id} className="rounded-2xl bg-white p-8 text-center shadow-[var(--shadow-card)]">
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

      <footer id="footer" className="bg-[var(--gray-900)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {footerGroups.map((group) => (
              <div key={group.title.bg}>
                <h4 className="mb-4 font-semibold">{group.title[locale]}</h4>
                <ul className="space-y-2">
                  {group.links.map((item) => (
                    <li key={item.bg} className="text-sm text-[var(--gray-400)]">
                      {item[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="mb-4 font-semibold">{locale === "bg" ? "Бюлетин" : "Newsletter"}</h4>
              <p className="mb-4 text-sm text-[var(--gray-400)]">{copy.newsletterText}</p>
              <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="email"
                  placeholder={copy.newsletterPlaceholder}
                  className="flex-1 rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-3 py-2 text-sm text-white"
                />
                <button type="submit" className="rounded-lg bg-[var(--primary)] px-3 text-white">
                  <Mail className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </footer>

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

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
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
        <div className={`mt-2 text-sm ${product.inStock ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
          {product.inStock ? inStockLabel : outOfStockLabel}
        </div>
      </div>
    </div>
  );
}

function HeaderIcon({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--gray-700)] transition hover:bg-[var(--gray-100)]"
    >
      {icon}
    </button>
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
