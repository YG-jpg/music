"use client";

import { startTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Globe, Mail } from "lucide-react";
import {
  categoryShowcases,
  socialLinks,
  storefrontCopy,
  storefrontFooterGroups,
  type Locale,
} from "@/lib/storefront-data";

function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default function CategoriesPage() {
  const [locale, setLocale] = useState<Locale>("bg");
  const copy = storefrontCopy[locale];

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-black italic text-white">
              M
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">MusicWorld</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--primary)]">
                categories
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 text-sm text-[var(--gray-600)] md:flex">
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
              className="rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-semibold"
            >
              {copy.localeSwitch}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-[28px] bg-[linear-gradient(135deg,#111827,#1f2937)] px-6 py-10 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7cc4fc]">
            Thomann-style departments
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            {copy.showcaseTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-200 md:text-lg">
            {copy.showcaseText}
          </p>
        </section>

        <div className="space-y-8">
          {categoryShowcases.map((showcase) => (
            <section
              key={showcase.id}
              className="overflow-hidden rounded-[28px] border border-[rgba(255,102,0,0.14)] bg-white shadow-[var(--shadow-card)]"
            >
              <div className="grid xl:grid-cols-[270px_1fr]">
                <aside className="bg-[linear-gradient(180deg,#ff6600,#b64900)] p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffe1cb]">
                    {showcase.eyebrow[locale]}
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">
                    {showcase.label[locale]}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/82">
                    {showcase.description[locale]}
                  </p>

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
                      className="grid gap-4 rounded-3xl border border-[#ffd1b3] bg-[#fff7f1] p-4 transition hover:border-[var(--primary)] md:grid-cols-[180px_1fr]"
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
        </div>
      </main>

      <footer className="bg-[var(--gray-900)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-3 text-white">
              <Mail className="h-5 w-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
