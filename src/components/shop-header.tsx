"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import logoMain from "../../logo_main.png";
import {
  ChevronDown,
  Globe,
  Headphones,
  Heart,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

import { CartButton } from "@/components/cart-provider";
import { buttonStyles, cx } from "@/lib/button-styles";
import { categoryImageFallbacks } from "@/lib/catalog-image-fallbacks";
import categoriesData from "@/data/categories.json";
import navigationData from "@/data/navigation.json";
import siteSettingsData from "@/data/site-settings.json";
import type {
  Category,
  MainMenuItem,
  MegaMenuGroup,
  NavigationData,
  NavigationLink,
} from "@/types/ecommerce";

export type HeaderLocale = "bg" | "en";

interface ShopHeaderProps {
  locale: HeaderLocale;
  sectionLabel: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onLocaleToggle?: () => void;
  activeCategorySlug?: string;
  browsingCta?: {
    label: string;
    href: string;
  };
}

const navigation = navigationData as NavigationData;
const siteSettings = siteSettingsData;
const catalogCategories = categoriesData as Category[];
const liveCategorySlugs = new Set(catalogCategories.map((category) => category.slug));
const categoryBySlug = new Map(catalogCategories.map((category) => [category.slug, category] as const));
const categoryIdsWithChildren = new Set(
  catalogCategories.map((category) => category.parentId).filter((id): id is string => Boolean(id)),
);

const fallbackMegaImages: Record<string, string> = {
  "mega-guitars": categoryImageFallbacks.guitars,
  "mega-keyboards": categoryImageFallbacks.keyboards,
  "mega-studio": categoryImageFallbacks["studio-recording"],
  "mega-pa": categoryImageFallbacks["powered-mixers"],
};

const labelTranslations: Record<string, { bg: string; en: string }> = {
  Guitars: { bg: "Китари", en: "Guitars" },
  Bass: { bg: "Бас", en: "Bass" },
  Drums: { bg: "Барабани", en: "Drums" },
  Keyboards: { bg: "Клавишни", en: "Keyboards" },
  "Studio & Recording": { bg: "Студио", en: "Studio & Recording" },
  "DJ Equipment": { bg: "DJ", en: "DJ Equipment" },
  "PA & Live Sound": { bg: "Озвучаване", en: "PA & Live Sound" },
  Accessories: { bg: "Аксесоари", en: "Accessories" },
  Deals: { bg: "Оферти", en: "Deals" },
  "Shop by type": { bg: "По тип", en: "Shop by type" },
  "Popular brands": { bg: "Популярни марки", en: "Popular brands" },
  "Player setups": { bg: "За пианисти", en: "Player setups" },
  "Brand highlights": { bg: "Акцентни марки", en: "Brand highlights" },
  "Core studio gear": { bg: "Студио основи", en: "Core studio gear" },
  "Trusted brands": { bg: "Доверени марки", en: "Trusted brands" },
  "Core live sound": { bg: "Live sound основи", en: "Core live sound" },
  "Powered mixer brands": { bg: "Марки за powered mixers", en: "Powered mixer brands" },
  "Electric Guitars": { bg: "Електрически китари", en: "Electric Guitars" },
  "Acoustic Guitars": { bg: "Акустични китари", en: "Acoustic Guitars" },
  "Guitar Amps": { bg: "Усилватели за китара", en: "Guitar Amps" },
  "Pedals & Effects": { bg: "Педали и ефекти", en: "Pedals & Effects" },
  "Digital Pianos": { bg: "Дигитални пиана", en: "Digital Pianos" },
  Synthesizers: { bg: "Синтезатори", en: "Synthesizers" },
  "MIDI Keyboards": { bg: "MIDI клавиатури", en: "MIDI Keyboards" },
  "Audio Interfaces": { bg: "Аудио интерфейси", en: "Audio Interfaces" },
  "Studio Microphones": { bg: "Студийни микрофони", en: "Studio Microphones" },
  "Studio Monitors": { bg: "Студийни монитори", en: "Studio Monitors" },
  "Studio Headphones": { bg: "Студийни слушалки", en: "Studio Headphones" },
  "PA Speakers": { bg: "PA колони", en: "PA Speakers" },
  "Live Mixers": { bg: "Live миксери", en: "Live Mixers" },
  "Powered Mixers": { bg: "Powered миксери", en: "Powered Mixers" },
  "Wireless Systems": { bg: "Безжични системи", en: "Wireless Systems" },
};

const featuredCardCopy: Record<
  string,
  { title: { bg: string; en: string }; description: { bg: string; en: string } }
> = {
  "mega-guitars": {
    title: { bg: "Fender Player II акцент", en: "Fender Player II spotlight" },
    description: {
      bg: "Най-търсените електрически китари със stage-ready хардуер и модерни профили на грифа.",
      en: "Best-selling electric guitars with stage-ready hardware and modern neck profiles.",
    },
  },
  "mega-keyboards": {
    title: { bg: "Компактни клавишни за модерни студиа", en: "Compact keys for modern studios" },
    description: {
      bg: "Weighted пиана, desktop synths и controller клавиатури за хибриден workflow.",
      en: "Weighted pianos, desktop synths and controller keyboards for hybrid workflows.",
    },
  },
  "mega-studio": {
    title: { bg: "Apollo, Focusrite и Shure essentials", en: "Apollo, Focusrite and Shure essentials" },
    description: {
      bg: "Практичен път от starter interface до premium signal chain.",
      en: "A practical path from starter interface to premium signal chain.",
    },
  },
  "mega-pa": {
    title: { bg: "Powered mixer системи за мобилно PA", en: "Powered mixer rigs for mobile PA" },
    description: {
      bg: "All-in-one решения за репетиции, училища, барове и компактни event системи.",
      en: "All-in-one mixers for rehearsals, schools, bars and compact event systems.",
    },
  },
};

function translateLabel(label: string, locale: HeaderLocale) {
  return labelTranslations[label]?.[locale] ?? label;
}

function getFeaturedCopy(groupId: string, locale: HeaderLocale) {
  const copy = featuredCardCopy[groupId];

  if (!copy) {
    return null;
  }

  return {
    title: copy.title[locale],
    description: copy.description[locale],
  };
}

function resolveNavHref(link: Pick<NavigationLink, "href" | "categorySlug">) {
  if (link.categorySlug && liveCategorySlugs.has(link.categorySlug)) {
    const category = categoryBySlug.get(link.categorySlug);

    if (!category) {
      return "/categories";
    }

    const hasChildren = categoryIdsWithChildren.has(category.id);

    return hasChildren
      ? `/categories/${link.categorySlug}`
      : `/categories/${link.categorySlug}/items`;
  }

  if (link.href === "/deals") {
    return "/#products";
  }

  return "/categories";
}

function resolveFeaturedHref(groupId: string) {
  if (groupId === "mega-guitars") {
    return "/categories/guitars";
  }

  if (groupId === "mega-keyboards") {
    return "/categories/keyboards";
  }

  if (groupId === "mega-studio") {
    return "/categories/studio-recording";
  }

  return groupId === "mega-pa" ? "/categories/pa-live-sound" : "/categories";
}

function resolveFeaturedImage(group: MegaMenuGroup) {
  if (group.featuredCard.image.startsWith("http")) {
    return group.featuredCard.image;
  }

  return fallbackMegaImages[group.id] ?? fallbackMegaImages["mega-pa"];
}

function isItemActive(item: MainMenuItem, activeCategorySlug?: string) {
  if (!activeCategorySlug) {
    return false;
  }

  return item.categorySlug === activeCategorySlug;
}

export function ShopHeader({
  locale,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onLocaleToggle,
  activeCategorySlug,
  browsingCta,
}: ShopHeaderProps) {
  const [openMegaMenuId, setOpenMegaMenuId] = useState<string | null>(null);
  const [hoveredMenuIndex, setHoveredMenuIndex] = useState<number | null>(null);
  const showSearch = typeof searchValue === "string" && typeof onSearchChange === "function";
  const openMegaMenu =
    navigation.megaMenuGroups.find((group) => group.id === openMegaMenuId) ?? null;

  const quickSearchLinks = [
    {
      label: locale === "bg" ? "Powered Mixers" : "Powered Mixers",
      href: "/categories/powered-mixers/items",
    },
    {
      label: locale === "bg" ? "Дигитални пиана" : "Digital Pianos",
      href: "/categories/digital-pianos/items",
    },
    {
      label: locale === "bg" ? "Аудио интерфейси" : "Audio Interfaces",
      href: "/categories/audio-interfaces/items",
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 shadow-[0_18px_42px_-40px_rgba(23,22,19,0.6)] backdrop-blur supports-[backdrop-filter]:bg-white/92">
      <div className="hidden border-b border-[#153558] bg-[linear-gradient(90deg,#102844,#18385c)] py-2 text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-1 text-sm divide-x divide-white/10">
            <UtilityItem icon={<Truck className="h-4 w-4" />}>
              {locale === "bg"
                ? "Безплатна доставка над EUR 149"
                : `Free shipping over EUR ${siteSettings.shipping.freeShippingThreshold}`}
            </UtilityItem>
            <UtilityItem icon={<ShieldCheck className="h-4 w-4" />}>
              {locale === "bg" ? "Официални марки и сервиз" : "Official brands and support"}
            </UtilityItem>
            <UtilityItem icon={<Headphones className="h-4 w-4" />}>
              {locale === "bg"
                ? `Поддръжка ${siteSettings.contact.supportHours}`
                : `Support ${siteSettings.contact.supportHours}`}
            </UtilityItem>
            <UtilityItem icon={<RotateCcw className="h-4 w-4" />}>
              {locale === "bg" ? "Връщане и съдействие" : "Returns and after-sales help"}
            </UtilityItem>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a
              href={`tel:${siteSettings.contact.phone}`}
              className="hidden items-center gap-2 text-white/80 transition hover:text-white lg:flex"
            >
              <PhoneCall className="h-4 w-4" />
              <span>{siteSettings.contact.phone}</span>
            </a>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>EUR</span>
            </div>
            {onLocaleToggle ? (
              <button
                type="button"
                onClick={onLocaleToggle}
                className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {locale === "bg" ? "English" : "Български"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-5">
          <Link href="/" className="block shrink-0">
            <Image
              src={logoMain}
              alt="MusicWorld logo"
              width={232}
              height={80}
              priority
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          {showSearch ? (
            <div className="hidden min-w-0 max-w-3xl flex-1 md:block">
              <div className="rounded-[22px] border border-[rgba(12,140,233,0.22)] bg-[linear-gradient(180deg,#ffffff,#f3f9ff)] p-2 shadow-[0_22px_48px_-36px_rgba(12,140,233,0.42)] transition focus-within:border-[var(--primary)] focus-within:bg-white">
                <div className="mb-1 flex items-center justify-between px-3 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                    {locale === "bg" ? "Търсене в каталога" : "Search catalog"}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--gray-500)]">
                    {locale === "bg" ? "Марка, модел или SKU" : "Brand, model or SKU"}
                  </span>
                </div>
                <SearchField
                  value={searchValue}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder ?? ""}
                  dense
                />
              </div>
              <div className="mt-2 hidden items-center gap-2 text-xs text-[var(--gray-500)] xl:flex">
                <span className="font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                  {locale === "bg" ? "Популярно" : "Popular"}
                </span>
                {quickSearchLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-medium transition hover:border-[rgba(12,140,233,0.18)] hover:text-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden flex-1 md:block" />
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onLocaleToggle ? (
              <button
                type="button"
                onClick={onLocaleToggle}
                className={cx(buttonStyles.secondary, "px-3 py-2 text-xs md:hidden")}
              >
                {locale === "bg" ? "English" : "Български"}
              </button>
            ) : null}
            <HeaderIconButton
              icon={<Heart className="h-5 w-5" />}
              label={locale === "bg" ? "Любими" : "Wishlist"}
            />
            <HeaderIconButton
              icon={<User className="h-5 w-5" />}
              label={locale === "bg" ? "Профил" : "Account"}
            />
            <CartButton className="border border-[rgba(12,140,233,0.14)] bg-[linear-gradient(180deg,#ffffff,#f3f9ff)] hover:bg-[var(--gray-100)]" />
          </div>
        </div>

        {showSearch ? (
          <div className="mt-4 md:hidden">
            <div className="rounded-[22px] border border-[rgba(12,140,233,0.22)] bg-[linear-gradient(180deg,#ffffff,#f3f9ff)] p-2 shadow-[0_22px_48px_-36px_rgba(12,140,233,0.42)]">
              <SearchField
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder ?? ""}
                dense
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 border-t border-[rgba(12,140,233,0.12)] pt-3">
          <div
            className="relative hidden items-center gap-4 md:flex"
            onMouseLeave={() => {
              setOpenMegaMenuId(null);
              setHoveredMenuIndex(null);
            }}
          >
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gray-400)] xl:block">
              {locale === "bg" ? "Отдели" : "Departments"}
            </span>

            <div className="relative flex min-w-0 flex-1 items-center justify-center gap-1.5">
              {navigation.mainMenu.map((item, index) => {
                const isActive = isItemActive(item, activeCategorySlug);

                return (
                  <div key={item.id} className="relative">
                    <Link
                      href={resolveNavHref(item)}
                      onMouseEnter={() => {
                        setOpenMegaMenuId(item.megaMenuGroupId ?? null);
                        setHoveredMenuIndex(index);
                      }}
                      onFocus={() => {
                        setOpenMegaMenuId(item.megaMenuGroupId ?? null);
                        setHoveredMenuIndex(index);
                      }}
                      className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                        isActive
                          ? "border-[rgba(12,140,233,0.18)] bg-[var(--blue-100)] text-[var(--blue-900)] shadow-[0_12px_28px_-24px_rgba(12,140,233,0.55)]"
                          : "border-transparent bg-white text-[var(--gray-700)] hover:border-[rgba(12,140,233,0.12)] hover:bg-[var(--gray-100)] hover:text-[var(--primary)]"
                      }`}
                    >
                      <span>{translateLabel(item.label, locale)}</span>
                      {item.megaMenuGroupId ? <ChevronDown className="h-4 w-4" /> : null}
                    </Link>
                  </div>
                );
              })}

              {openMegaMenu ? (
                <div className="absolute left-1/2 top-full z-50 mt-4 w-full max-w-5xl -translate-x-1/2">
                  <MegaMenuPanel group={openMegaMenu} locale={locale} />
                </div>
              ) : null}
            </div>

            <VerticalHeaderMixer
              itemCount={navigation.mainMenu.length}
              activeIndex={hoveredMenuIndex}
            />

            {browsingCta ? (
              <Link
                href={browsingCta.href}
                className={cx(buttonStyles.secondary, "hidden xl:inline-flex")}
              >
                {browsingCta.label}
              </Link>
            ) : null}
          </div>

          <div className="-mx-4 overflow-x-auto md:hidden">
            <nav className="flex min-w-max items-center gap-2 px-4 pb-1">
              {navigation.mainMenu.map((item) => {
                const isActive = isItemActive(item, activeCategorySlug);

                return (
                  <Link
                    key={item.id}
                    href={resolveNavHref(item)}
                    className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--blue-100)] text-[var(--blue-900)]"
                        : "border-[var(--border)] bg-white text-[var(--gray-700)]"
                    }`}
                  >
                    {translateLabel(item.label, locale)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function getMixerImageDrift(activeIndex: number | null, itemCount: number) {
  if (activeIndex === null || itemCount <= 1) {
    return { x: 0, y: 0 };
  }

  const progress = activeIndex / (itemCount - 1);
  const y = (progress - 0.5) * 18;
  const x = activeIndex % 2 === 0 ? -2 : 2;

  return { x, y };
}

function VerticalHeaderMixer({
  itemCount,
  activeIndex,
}: {
  itemCount: number;
  activeIndex: number | null;
}) {
  const drift = getMixerImageDrift(activeIndex, itemCount);

  return (
    <div aria-hidden="true" className="relative -mb-6 -mt-7 hidden h-[194px] w-[94px] shrink-0 lg:block">
      <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-[#1b1c20] shadow-[0_22px_34px_-28px_rgba(0,0,0,0.9)]">
        <Image
          src="/images/header-mixer-console.png"
          alt=""
          width={928}
          height={768}
          sizes="94px"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[255px] w-auto max-w-none select-none"
          style={{
            transform: `translate(calc(-50% + ${drift.x}px), calc(-50% + ${drift.y}px)) rotate(90deg) scale(1.2)`,
            transformOrigin: "center",
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,16,22,0.1),rgba(7,8,12,0.42))]" />
      </div>
    </div>
  );
}

function MegaMenuPanel({
  group,
  locale,
}: {
  group: MegaMenuGroup;
  locale: HeaderLocale;
}) {
  const featuredHref = resolveFeaturedHref(group.id);
  const featuredCopy = getFeaturedCopy(group.id, locale);

  return (
    <div className="rounded-[24px] border border-[rgba(12,140,233,0.12)] bg-white p-6 shadow-[var(--shadow-dropdown)]">
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          {group.columns.map((column) => (
            <div key={column.id}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                {translateLabel(column.title, locale)}
              </div>
              <div className="mt-3 space-y-2">
                {column.items.map((item) => (
                  <Link
                    key={item.id}
                    href={resolveNavHref(item)}
                    className="flex items-center justify-between rounded-xl border border-transparent bg-[var(--gray-50)] px-4 py-3 text-sm font-semibold text-[var(--gray-700)] transition hover:border-[rgba(12,140,233,0.12)] hover:bg-[var(--blue-100)] hover:text-[var(--blue-900)]"
                  >
                    <span>{translateLabel(item.label, locale)}</span>
                    <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Link
          href={featuredHref}
          className="group overflow-hidden rounded-[22px] border border-[rgba(12,140,233,0.1)] bg-[linear-gradient(180deg,#ffffff,#f3f9ff)]"
        >
          <div className="relative aspect-[1.2/1] overflow-hidden bg-[var(--gray-100)]">
            <Image
              src={resolveFeaturedImage(group)}
              alt={group.featuredCard.title}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,24,39,0.82)] to-transparent" />
          </div>
          <div className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              {translateLabel(group.title, locale)}
            </div>
            <h3 className="mt-2 text-xl font-black tracking-tight">
              {featuredCopy?.title ?? group.featuredCard.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--gray-600)]">
              {featuredCopy?.description ?? group.featuredCard.description}
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)]">
              {locale === "bg" ? "Разгледай отдела" : "Browse department"}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  dense = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dense?: boolean;
}) {
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-transparent text-sm outline-none placeholder:text-[var(--gray-400)] ${
          dense
            ? "py-3.5 pl-11 pr-24"
            : "border border-[var(--border)] px-4 py-3 pl-11 pr-4"
        }`}
      />
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
      {dense ? (
        <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Search
        </span>
      ) : null}
    </div>
  );
}

function UtilityItem({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-4 text-white/78 first:pl-0 last:pr-0">
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </div>
  );
}

function HeaderIconButton({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(12,140,233,0.12)] bg-[linear-gradient(180deg,#ffffff,#f3f9ff)] text-[var(--gray-700)] transition hover:border-[rgba(12,140,233,0.2)] hover:bg-[var(--gray-100)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      {icon}
    </button>
  );
}
