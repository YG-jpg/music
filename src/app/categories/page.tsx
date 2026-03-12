"use client";

import { startTransition, useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Headphones, Mail, Truck } from "lucide-react";
import { ShopHeader } from "@/components/shop-header";
import { buttonStyles } from "@/lib/button-styles";
import siteSettingsData from "@/data/site-settings.json";
import {
  categoryShowcases,
  socialLinks,
  storefrontCopy,
  storefrontFooterGroups,
  type Locale,
} from "@/lib/storefront-data";

const showcaseRouteById: Record<string, string> = {
  "heavy-guitars": "/categories/guitars",
  "digital-pianos": "/categories/digital-pianos",
  "creator-studio": "/categories/studio-recording",
};

function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default function CategoriesPage() {
  const [locale, setLocale] = useState<Locale>("bg");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const copy = storefrontCopy[locale];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const visibleShowcases = categoryShowcases.filter((showcase) => {
    if (!normalizedSearch) {
      return true;
    }

    const searchBlob = [
      showcase.label[locale],
      showcase.description[locale],
      showcase.eyebrow[locale],
      showcase.featuredProduct.name[locale],
      showcase.featuredProduct.description[locale],
      ...showcase.links.map((link) => link.label[locale]),
      ...showcase.products.flatMap((product) => [
        product.brand,
        product.name[locale],
        product.description[locale],
      ]),
    ]
      .join(" ")
      .toLowerCase();

    return searchBlob.includes(normalizedSearch);
  });

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <ShopHeader
        locale={locale}
        sectionLabel="categories"
        searchValue={search}
        searchPlaceholder={
          locale === "bg"
            ? "Търси категории, марки и продукти"
            : "Search departments, brands and products"
        }
        onSearchChange={setSearch}
        onLocaleToggle={() =>
          startTransition(() => setLocale((current) => (current === "bg" ? "en" : "bg")))
        }
        browsingCta={{
          label: locale === "bg" ? "Powered Mixers" : "Powered Mixers",
          href: "/categories/powered-mixers",
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-[28px] bg-[linear-gradient(135deg,#102844,#18385c)] px-6 py-10 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blue-200)]">
            Store departments
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            {copy.showcaseTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-200 md:text-lg">
            {copy.showcaseText}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/85">
            <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
              {visibleShowcases.length} working departments
            </span>
            <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
              Real product links and EUR pricing
            </span>
            <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
              Free shipping over {formatCurrency(siteSettingsData.shipping.freeShippingThreshold, locale)}
            </span>
          </div>
        </section>

        <div className="space-y-8">
          {visibleShowcases.map((showcase) => (
            <section
              key={showcase.id}
              className="overflow-hidden rounded-[28px] border border-[rgba(12,140,233,0.14)] bg-white shadow-[var(--shadow-card)]"
            >
              <div className="grid xl:grid-cols-[270px_1fr]">
                <aside className="bg-[linear-gradient(180deg,#0c2a49,#17456f)] p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blue-200)]">
                    {showcase.eyebrow[locale]}
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">
                    {showcase.label[locale]}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/82">
                    {showcase.description[locale]}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      {showcase.products.length + 1} {copy.productsLabel}
                    </span>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      {showcase.products.filter((product) => product.inStock).length + Number(showcase.featuredProduct.inStock)}{" "}
                      {locale === "bg" ? "налични" : "in stock"}
                    </span>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      {showcase.products.filter((product) => product.originalPrice || product.badge === "deal").length +
                        Number(Boolean(showcase.featuredProduct.originalPrice || showcase.featuredProduct.badge === "deal"))}{" "}
                      {locale === "bg" ? "с оферта" : "on deal"}
                    </span>
                  </div>

                  <Link
                    href={showcaseRouteById[showcase.id] ?? "/categories"}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/28"
                  >
                    <span>{locale === "bg" ? "Към retail страницата" : "Open retail page"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <div className="mt-6 space-y-2">
                    {showcase.links.map((link) => (
                      <a
                        key={link.label.en}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/16"
                      >
                        <span>{link.label[locale]}</span>
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </aside>

                <div className="p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                      {showcase.sourceLabel[locale]}
                    </span>
                    <a
                      href={showcase.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[var(--primary)]"
                    >
                      {copy.showcaseCta}
                    </a>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
                    <a
                      href={showcase.featuredProduct.href}
                      target="_blank"
                      rel="noreferrer"
                      className="grid gap-4 rounded-3xl border border-[rgba(12,140,233,0.14)] bg-[linear-gradient(180deg,#ffffff,#f6fbff)] p-4 transition hover:border-[var(--primary)] md:grid-cols-[180px_1fr]"
                    >
                      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-white">
                        <Image
                          src={showcase.featuredProduct.image}
                          alt={showcase.featuredProduct.name[locale]}
                          fill
                          sizes="(max-width: 768px) 100vw, 30vw"
                          className="object-contain p-4"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                          {showcase.featuredProduct.brand}
                        </p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight">
                          {showcase.featuredProduct.name[locale]}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--gray-600)]">
                          {showcase.featuredProduct.description[locale]}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          <span
                            className={`rounded-full px-3 py-1.5 ${
                              showcase.featuredProduct.inStock
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : "bg-[var(--error-soft)] text-[var(--error)]"
                            }`}
                          >
                            {showcase.featuredProduct.inStock ? copy.stock : copy.outOfStock}
                          </span>
                          {showcase.featuredProduct.originalPrice || showcase.featuredProduct.badge === "deal" ? (
                            <span className="rounded-full bg-[var(--blue-100)] px-3 py-1.5 text-[var(--blue-900)]">
                              {locale === "bg" ? "Активна оферта" : "Active deal"}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4">
                          {showcase.featuredProduct.originalPrice ? (
                            <div className="text-sm text-[var(--gray-500)] line-through">
                              {formatCurrency(showcase.featuredProduct.originalPrice, locale)}
                            </div>
                          ) : null}
                          <div className="text-2xl font-black">
                            {formatCurrency(showcase.featuredProduct.price, locale)}
                          </div>
                        </div>
                      </div>
                    </a>

                    <div className="grid gap-3 min-[520px]:grid-cols-2">
                      {showcase.products.map((product) => (
                        <a
                          key={product.id}
                          href={product.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-3xl border border-[var(--border)] bg-[var(--gray-50)] p-3 transition hover:border-[var(--primary)] hover:bg-white"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                            <Image
                              src={product.image}
                              alt={product.name[locale]}
                              fill
                              sizes="(max-width: 768px) 50vw, 20vw"
                              className="object-contain p-3"
                            />
                          </div>
                          <div className="mt-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                              {product.brand}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                              <span
                                className={`rounded-full px-2.5 py-1 ${
                                  product.inStock
                                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                                    : "bg-[var(--gray-200)] text-[var(--gray-600)]"
                                }`}
                              >
                                {product.inStock ? copy.stock : copy.outOfStock}
                              </span>
                              {product.originalPrice || product.badge === "deal" ? (
                                <span className="rounded-full bg-[var(--blue-100)] px-2.5 py-1 text-[var(--blue-900)]">
                                  {locale === "bg" ? "Оферта" : "Deal"}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold">
                              {product.name[locale]}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--gray-600)]">
                              {product.description[locale]}
                            </p>
                            <div className="mt-3">
                              {product.originalPrice ? (
                                <div className="text-xs text-[var(--gray-500)] line-through">
                                  {formatCurrency(product.originalPrice, locale)}
                                </div>
                              ) : null}
                              <div className="text-lg font-black">
                                {formatCurrency(product.price, locale)}
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {visibleShowcases.length === 0 ? (
            <section className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-white px-6 py-14 text-center">
              <h2 className="text-2xl font-black tracking-tight">
                {locale === "bg" ? "Няма съвпадения" : "No matching departments"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--gray-600)]">
                {locale === "bg"
                  ? "Пробвай с powered mixers, studio, Yamaha или digital pianos."
                  : "Try powered mixers, studio, Yamaha or digital pianos."}
              </p>
            </section>
          ) : null}
        </div>
      </main>

      <footer className="bg-[var(--gray-900)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="rounded-full bg-white/10 p-2 text-[var(--blue-200)]">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Shipping and dispatch</p>
                <p className="mt-1 text-sm text-[var(--gray-300)]">
                  {locale === "bg"
                    ? `Безплатна доставка над ${formatCurrency(siteSettingsData.shipping.freeShippingThreshold, locale)}`
                    : `Free shipping over ${formatCurrency(siteSettingsData.shipping.freeShippingThreshold, locale)}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="rounded-full bg-white/10 p-2 text-[var(--blue-200)]">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Advisor and support</p>
                <p className="mt-1 text-sm text-[var(--gray-300)]">
                  {siteSettingsData.contact.phone} • {siteSettingsData.contact.supportHours}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="rounded-full bg-white/10 p-2 text-[var(--blue-200)]">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Trusted category racks</p>
                <p className="mt-1 text-sm text-[var(--gray-300)]">
                  {locale === "bg"
                    ? "Реални продукти, source линкове и по-структуриран retail преглед."
                    : "Real products, source links and a more structured retail overview."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {storefrontFooterGroups.map((group) => (
              <div key={group.title.en}>
                <h4 className="mb-4 font-semibold">{group.title[locale]}</h4>
                <ul className="space-y-2">
                  {group.links.map((item) => (
                    <li key={item.label.en}>
                      <a href={item.href} className="text-sm text-[var(--gray-400)]">
                        {item.label[locale]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gray-800)]"
              >
                {link.platform === "facebook" ? (
                  <span>f</span>
                ) : link.platform === "instagram" ? (
                  <span>i</span>
                ) : link.platform === "youtube" ? (
                  <span>y</span>
                ) : (
                  <span>t</span>
                )}
              </a>
            ))}
          </div>

          <form className="mt-8 flex max-w-md gap-2" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder={copy.newsletterPlaceholder}
              className="min-w-0 flex-1 rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-3 py-2 text-sm text-white"
            />
            <button type="submit" className={buttonStyles.primary}>
              <Mail className="h-5 w-5" />
            </button>
          </form>
          <div className="mt-4 space-y-2 text-sm text-[var(--gray-400)]">
            <p>{siteSettingsData.contact.email}</p>
            <p>
              {locale === "bg"
                ? "Цени с ДДС, експедиция според наличността и съдействие при стандартни поръчки."
                : "VAT-inclusive pricing, stock-led dispatch and support on standard orders."}
            </p>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-[var(--gray-400)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>
                {locale === "bg"
                  ? "Категориите използват реален feed, но presentation layer-ът остава frontend-driven."
                  : "The categories use a real feed, while the presentation layer stays frontend-driven."}
              </p>
              <p>{copy.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
