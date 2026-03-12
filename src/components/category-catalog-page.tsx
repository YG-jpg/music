"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Filter,
  Heart,
  Info,
  Minus,
  PhoneCall,
  Plus,
  RotateCcw,
  SearchX,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

import { useCart } from "@/components/cart-provider";
import { ShopHeader } from "@/components/shop-header";
import siteSettingsData from "@/data/site-settings.json";
import { buttonStyles, cx } from "@/lib/button-styles";
import {
  getCategoryFallbackImage,
  getProductFallbackImage,
} from "@/lib/catalog-image-fallbacks";
import {
  formatCount,
  formatEuro,
  getAvailabilityMeta,
  getBadgeClasses,
  getDispatchLabel,
  getSavingsAmount,
  getSavingsPercent,
  humanizeBadge,
} from "@/lib/commerce-ui";
import type { CategoryBrowseItem } from "@/lib/category-page-data";
import type {
  Brand,
  Category,
  FilterConfig,
  Product,
  SortOptionId,
} from "@/types/ecommerce";

interface CategoryCatalogPageProps {
  category: Category;
  parentCategory: Category | null;
  childCategories: CategoryBrowseItem[];
  siblingCategories: CategoryBrowseItem[];
  products: Product[];
  brands: Brand[];
  filterConfig: FilterConfig;
}

const freeShippingThreshold = siteSettingsData.shipping.freeShippingThreshold;

function formatRangeLabel(min: number, max: number | null) {
  if (max === null) {
    return `${formatEuro(min)}+`;
  }

  return `${formatEuro(min)} - ${formatEuro(max)}`;
}

function translateFilterLabel(label: string) {
  const labels: Record<string, string> = {
    "Most popular": "Най-популярни",
    Newest: "Нови",
    "Price low to high": "Цена: ниска към висока",
    "Price high to low": "Цена: висока към ниска",
    "Best rated": "Най-висок рейтинг",
    "4 stars & up": "4 звезди и нагоре",
    "4.5 stars & up": "4.5 звезди и нагоре",
    "In stock": "В наличност",
    "Pre-order": "Предварителна поръчка",
    "Out of stock": "Изчерпани",
  };

  return labels[label] ?? label;
}

interface DerivedFacetSection {
  id: string;
  specName: string;
  title: string;
  options: Array<{
    id: string;
    value: string;
    count: number;
  }>;
}

function normalizeFacetId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function translateSpecTitle(specName: string) {
  const labels: Record<string, string> = {
    "Body Material": "Корпус",
    Fingerboard: "Фингърборд",
    "Pickup Configuration": "Адаптери",
    "Body Material ": "Корпус",
    Top: "Топ",
    Profile: "Профил",
    Pickups: "Адаптери",
    Channels: "Канали",
    Power: "Мощност",
    Effects: "Ефекти",
    EQ: "EQ",
    Outputs: "Изходи",
    Inputs: "Входове",
    Speakers: "Говорители",
    Woofer: "Ууфър",
    Tweeter: "Туитър",
    Connectivity: "Свързаност",
    Type: "Тип",
    Driver: "Драйвер",
    Conversion: "Конверсия",
    "I/O": "I/O",
    Pads: "Pads",
    Stand: "Стойка",
    Length: "Дължина",
    Material: "Материал",
    Format: "Формат",
    "Mic Inputs": "Микрофонни входове",
    "Stereo Inputs": "Стерео входове",
    "USB Audio": "USB аудио",
  };

  return labels[specName] ?? specName;
}

function buildDerivedFacetSections(products: Product[]) {
  const sections = new Map<string, Map<string, number>>();

  for (const product of products) {
    for (const spec of product.specs) {
      const values = sections.get(spec.name) ?? new Map<string, number>();
      values.set(spec.value, (values.get(spec.value) ?? 0) + 1);
      sections.set(spec.name, values);
    }
  }

  return [...sections.entries()]
    .map(([specName, values]) => ({
      id: normalizeFacetId(specName),
      specName,
      title: translateSpecTitle(specName),
      options: [...values.entries()]
        .map(([value, count]) => ({
          id: `${normalizeFacetId(specName)}-${normalizeFacetId(value)}`,
          value,
          count,
        }))
        .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value)),
    }))
    .filter((section) => section.options.length > 1)
    .sort((left, right) => right.options.length - left.options.length)
    .slice(0, 10);
}

function sortProducts(products: Product[], sortBy: SortOptionId) {
  return [...products].sort((left, right) => {
    switch (sortBy) {
      case "newest":
        return Number(right.newArrival) - Number(left.newArrival) || right.reviewCount - left.reviewCount;
      case "price-low-to-high":
        return left.price - right.price || right.reviewCount - left.reviewCount;
      case "price-high-to-low":
        return right.price - left.price || right.reviewCount - left.reviewCount;
      case "best-rated":
        return right.rating - left.rating || right.reviewCount - left.reviewCount;
      case "most-popular":
      default:
        return (
          Number(right.bestseller) * 1000 +
          right.reviewCount * 10 +
          right.rating -
          (Number(left.bestseller) * 1000 + left.reviewCount * 10 + left.rating)
        );
    }
  });
}

function resolveCategoryImage(category: Category, parentCategory: Category | null) {
  if (category.image.startsWith("http")) {
    return category.image;
  }

  return getCategoryFallbackImage(category.slug, parentCategory?.slug, "pa-live-sound");
}

function resolveProductImage(product: Product) {
  const directImage = product.images[0]?.src;

  if (directImage?.startsWith("http")) {
    return directImage;
  }

  return getProductFallbackImage(product);
}

function getCategoryEyebrow(category: Category, parentCategory: Category | null) {
  if (parentCategory) {
    return `${parentCategory.name} department`;
  }

  return "Music retail catalog";
}

function getCategoryIntro(category: Category, browseItems: CategoryBrowseItem[]) {
  if (browseItems.length > 0) {
    return `${category.description} Разгледай подкатегориите, сравни марки, цени, рейтинг и наличност от една страница.`;
  }

  return `${category.description} Каталогът е подреден с ясни филтри, цени в EUR и stock сигнали като в реален музикален магазин.`;
}

function getSeoCopy(category: Category, parentCategory: Category | null) {
  if (parentCategory) {
    return `В ${parentCategory.name} > ${category.name} гледай кои модели са налични, кои имат активна цена и кои марки държат най-силен рейтинг. Това прави сравняването по-бързо и по-близко до реален retail workflow.`;
  }

  return `В отдела ${category.name} държим ясен каталог с подкатегории, филтри по марка, цена и рейтинг, както и по-видими сигнали за наличност, доставка и промоции.`;
}

export default function CategoryCatalogPage({
  category,
  parentCategory,
  childCategories,
  siblingCategories,
  products,
  brands,
  filterConfig,
}: CategoryCatalogPageProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOptionId>("most-popular");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedAvailabilityIds, setSelectedAvailabilityIds] = useState<string[]>([]);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const [selectedPriceMin, setSelectedPriceMin] = useState<number | null>(null);
  const [selectedPriceMax, setSelectedPriceMax] = useState<number | null>(null);
  const [selectedSpecFilters, setSelectedSpecFilters] = useState<Record<string, string[]>>({});
  const [expandedFacetIds, setExpandedFacetIds] = useState<string[]>([
    "brands",
    "price",
    "availability",
    "rating",
  ]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const activeCategorySlug = parentCategory?.slug ?? category.slug;
  const browseItems = childCategories.length > 0 ? childCategories : siblingCategories;
  const brandById = useMemo(() => new Map(brands.map((brand) => [brand.id, brand])), [brands]);
  const derivedFacetSections = useMemo(() => buildDerivedFacetSections(products), [products]);
  const relevantBrands = brands.filter((brand) =>
    products.some((product) => product.brandId === brand.id),
  );
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const selectedRating =
    filterConfig.rating.find((rating) => rating.id === selectedRatingId) ?? null;
  const selectedAvailabilityValues = filterConfig.availability
    .filter((option) => selectedAvailabilityIds.includes(option.id))
    .flatMap((option) => option.values);
  const priceBounds = useMemo(
    () => ({
      min: Math.min(...products.map((product) => product.price)),
      max: Math.max(...products.map((product) => product.price)),
    }),
    [products],
  );
  const inStockCount = products.filter((product) =>
    ["in_stock", "low_stock"].includes(product.availability),
  ).length;
  const freeShippingCount = products.filter((product) => product.shipping.freeShippingEligible).length;
  const bestsellingCount = products.filter((product) => product.bestseller).length;
  const dealCount = products.filter(
    (product) =>
      product.badges.includes("deal") ||
      (typeof product.oldPrice === "number" && product.oldPrice > product.price),
  ).length;
  const topBrands = [...relevantBrands]
    .sort(
      (left, right) =>
        products.filter((product) => product.brandId === right.id).length -
        products.filter((product) => product.brandId === left.id).length,
    )
    .slice(0, 4);
  const effectivePriceMin = selectedPriceMin ?? priceBounds.min;
  const effectivePriceMax = selectedPriceMax ?? priceBounds.max;

  const filteredProducts = sortProducts(
    products.filter((product) => {
      const searchBlob = [
        product.name,
        product.shortDescription,
        product.description,
        product.sku,
        brandById.get(product.brandId)?.name ?? "",
        ...product.specs.map((spec) => `${spec.name} ${spec.value}`),
      ]
        .join(" ")
        .toLowerCase();

      if (normalizedSearch && !searchBlob.includes(normalizedSearch)) {
        return false;
      }

      if (selectedBrandIds.length > 0 && !selectedBrandIds.includes(product.brandId)) {
        return false;
      }

      if (product.price < effectivePriceMin || product.price > effectivePriceMax) {
        return false;
      }

      if (selectedRating && product.rating < selectedRating.minRating) {
        return false;
      }

      if (
        selectedAvailabilityValues.length > 0 &&
        !selectedAvailabilityValues.includes(product.availability)
      ) {
        return false;
      }

      for (const [specName, values] of Object.entries(selectedSpecFilters)) {
        if (values.length === 0) {
          continue;
        }

        const productValues = product.specs
          .filter((spec) => spec.name === specName)
          .map((spec) => spec.value);

        if (!values.some((value) => productValues.includes(value))) {
          return false;
        }
      }

      return true;
    }),
    sortBy,
  );

  const activeFilters = [
    ...(normalizedSearch
      ? [
          {
            id: "search",
            label: `Търсене: ${search}`,
            onRemove: () => setSearch(""),
          },
        ]
      : []),
    ...selectedBrandIds.map((brandId) => ({
      id: `brand-${brandId}`,
      label: brandById.get(brandId)?.name ?? brandId,
      onRemove: () =>
        setSelectedBrandIds((current) => current.filter((value) => value !== brandId)),
    })),
    ...(selectedPriceMin !== null || selectedPriceMax !== null
      ? [
          {
            id: "price-range",
            label: formatRangeLabel(selectedPriceMin ?? priceBounds.min, selectedPriceMax ?? priceBounds.max),
            onRemove: () => {
              setSelectedPriceMin(null);
              setSelectedPriceMax(null);
            },
          },
        ]
      : []),
    ...(selectedRating
      ? [
          {
            id: `rating-${selectedRating.id}`,
            label: translateFilterLabel(selectedRating.label),
            onRemove: () => setSelectedRatingId(null),
          },
        ]
      : []),
    ...filterConfig.availability
      .filter((option) => selectedAvailabilityIds.includes(option.id))
      .map((option) => ({
        id: `availability-${option.id}`,
        label: translateFilterLabel(option.label),
        onRemove: () =>
          setSelectedAvailabilityIds((current) => current.filter((value) => value !== option.id)),
      })),
    ...Object.entries(selectedSpecFilters).flatMap(([specName, values]) =>
      values.map((value) => ({
        id: `spec-${specName}-${value}`,
        label: `${translateSpecTitle(specName)}: ${value}`,
        onRemove: () =>
          setSelectedSpecFilters((current) => ({
            ...current,
            [specName]: (current[specName] ?? []).filter((item) => item !== value),
          })),
      })),
    ),
  ];

  const clearFilters = () => {
    setSelectedBrandIds([]);
    setSelectedAvailabilityIds([]);
    setSelectedRatingId(null);
    setSelectedPriceMin(null);
    setSelectedPriceMax(null);
    setSelectedSpecFilters({});
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <ShopHeader
        locale="bg"
        sectionLabel={category.slug}
        searchValue={search}
        searchPlaceholder="Търси модел, марка или спецификация"
        onSearchChange={setSearch}
        activeCategorySlug={activeCategorySlug}
        browsingCta={{
          label: "Всички категории",
          href: "/categories",
        }}
      />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--gray-900)] text-white">
          <div className="absolute inset-0">
            <Image
              src={resolveCategoryImage(category, parentCategory)}
              alt={category.name}
              fill
              sizes="100vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,22,19,0.92),rgba(23,22,19,0.72),rgba(23,22,19,0.66))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(12,140,233,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(10,64,110,0.24),transparent_28%)]" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/65">
                <Link href="/" className="transition hover:text-white">
                  Начало
                </Link>
                <ChevronRight className="h-4 w-4 text-white/35" />
                <Link href="/categories" className="transition hover:text-white">
                  Категории
                </Link>
                {parentCategory ? (
                  <>
                    <ChevronRight className="h-4 w-4 text-white/35" />
                    <Link
                      href={`/categories/${parentCategory.slug}`}
                      className="transition hover:text-white"
                    >
                      {parentCategory.name}
                    </Link>
                  </>
                ) : null}
                <ChevronRight className="h-4 w-4 text-white/35" />
                <span className="text-white">{category.name}</span>
              </nav>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blue-200)]">
                {getCategoryEyebrow(category, parentCategory)}
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                {category.name}
              </h1>
              <p className="mt-5 text-base leading-7 text-white/80 md:text-lg">
                {getCategoryIntro(category, browseItems)}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrustChip icon={<Truck className="h-4 w-4" />} label={`Безплатна доставка над ${formatEuro(freeShippingThreshold)}`} />
                <TrustChip icon={<ShoppingBag className="h-4 w-4" />} label={`${formatCount(inStockCount)} налични артикула`} />
                <TrustChip icon={<Filter className="h-4 w-4" />} label="Филтри по марка, цена и рейтинг" />
                <TrustChip icon={<RotateCcw className="h-4 w-4" />} label="Съдействие и стандартно връщане" />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="grid gap-4 min-[520px]:grid-cols-3 lg:grid-cols-1">
                <Metric label="Артикули" value={formatCount(products.length)} />
                <Metric label="Марки" value={formatCount(relevantBrands.length)} />
                <Metric label="С безплатна доставка" value={formatCount(freeShippingCount)} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Бързо ориентиране
                </div>
                <div className="mt-2 text-sm leading-6 text-white/85">
                  {topBrands.length > 0
                    ? `Водещи марки: ${topBrands.map((brand) => brand.name).join(", ")}`
                    : "Използвай филтрите за по-точен подбор по марка и цена."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-4 rounded-[30px] border border-[rgba(12,140,233,0.1)] bg-white p-5 shadow-[var(--shadow-card)] lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Department browse
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                {childCategories.length > 0
                  ? `Подкатегории и модели в ${category.name}`
                  : `Подбрани модели в ${category.name}`}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--gray-600)]">
                {category.description} Всяка карта показва по-ясно цена, рейтинг, dispatch и наличност, така че да стигнеш по-бързо до правилния вариант.
              </p>

              {browseItems.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {browseItems.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/categories/${item.slug}`}
                      className="rounded-2xl border border-[rgba(12,140,233,0.1)] bg-white p-4 transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-card)]"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                        {childCategories.length > 0 ? "Подкатегория" : "Още в отдела"}
                      </div>
                      <div className="mt-2 text-base font-semibold text-[var(--gray-900)]">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-[var(--gray-500)]">
                        {formatCount(item.productCount)} артикула
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {topBrands.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-[rgba(12,140,233,0.1)] bg-[var(--gray-50)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                    Популярни марки
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topBrands.map((brand) => (
                      <span
                        key={brand.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(12,140,233,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[var(--gray-700)]"
                      >
                        <span>{brand.name}</span>
                        <span className="text-xs font-medium text-[var(--gray-500)]">
                          {formatCount(
                            products.filter((product) => product.brandId === brand.id).length,
                          )} артикула
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <CatalogCue
                label="Водещи марки"
                value={topBrands.map((brand) => brand.name).join(", ") || "Подбор от активни марки"}
              />
              <CatalogCue
                label="Бестселъри"
                value={`${formatCount(bestsellingCount)} модела с висок интерес`}
              />
              <CatalogCue
                label="Оферти"
                value={`${formatCount(dealCount)} артикула с активна цена или промо етикет`}
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <FilterPanel
                activeFilterCount={activeFilters.length}
                relevantBrands={relevantBrands}
                products={products}
                filterConfig={filterConfig}
                selectedBrandIds={selectedBrandIds}
                selectedAvailabilityIds={selectedAvailabilityIds}
                selectedRatingId={selectedRatingId}
                selectedPriceMin={selectedPriceMin}
                selectedPriceMax={selectedPriceMax}
                priceBounds={priceBounds}
                derivedFacetSections={derivedFacetSections}
                selectedSpecFilters={selectedSpecFilters}
                expandedFacetIds={expandedFacetIds}
                onToggleBrand={(brandId) =>
                  setSelectedBrandIds((current) =>
                    current.includes(brandId)
                      ? current.filter((value) => value !== brandId)
                      : [...current, brandId],
                  )
                }
                onToggleAvailability={(availabilityId) =>
                  setSelectedAvailabilityIds((current) =>
                    current.includes(availabilityId)
                      ? current.filter((value) => value !== availabilityId)
                      : [...current, availabilityId],
                  )
                }
                onSelectRating={(ratingId) =>
                  setSelectedRatingId((current) => (current === ratingId ? null : ratingId))
                }
                onPriceMinChange={setSelectedPriceMin}
                onPriceMaxChange={setSelectedPriceMax}
                onToggleFacetExpansion={(facetId) =>
                  setExpandedFacetIds((current) =>
                    current.includes(facetId)
                      ? current.filter((value) => value !== facetId)
                      : [...current, facetId],
                  )
                }
                onToggleSpecValue={(specName, value) =>
                  setSelectedSpecFilters((current) => {
                    const currentValues = current[specName] ?? [];

                    return {
                      ...current,
                      [specName]: currentValues.includes(value)
                        ? currentValues.filter((item) => item !== value)
                        : [...currentValues, value],
                    };
                  })
                }
                onClear={clearFilters}
              />
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className={cx(buttonStyles.secondary, "lg:hidden")}
                  >
                    <Filter className="h-4 w-4" />
                    Филтри
                  </button>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                      Каталог
                    </div>
                    <div className="mt-1 text-sm text-[var(--gray-600)]">
                      <span className="font-semibold text-[var(--gray-900)]">
                        {formatCount(filteredProducts.length)}
                      </span>{" "}
                      резултата в {category.name}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                    Сорт.
                  </div>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOptionId)}
                    className="appearance-none rounded-lg border border-[var(--border)] bg-white py-2.5 pl-14 pr-10 text-sm font-semibold outline-none"
                  >
                    {filterConfig.sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {translateFilterLabel(option.label)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-500)]" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-[var(--blue-100)] px-3 py-1.5 font-semibold text-[var(--blue-900)]">
                  Цени в EUR с ДДС
                </span>
                <span className="rounded-full border border-[rgba(12,140,233,0.1)] bg-white px-3 py-1.5 text-[var(--gray-600)] shadow-[var(--shadow-card)]">
                  Изпращане според наличността и склада
                </span>
                <span className="rounded-full border border-[rgba(12,140,233,0.1)] bg-white px-3 py-1.5 text-[var(--gray-600)] shadow-[var(--shadow-card)]">
                  Консултант по телефон и имейл преди поръчка
                </span>
              </div>

              {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4">
                  <div className="basis-full text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                    Активни филтри
                  </div>
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={filter.onRemove}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--blue-200)] bg-[var(--blue-100)] px-3 py-2 text-sm font-semibold text-[var(--blue-900)] transition hover:border-[var(--primary)]"
                    >
                      <span>{filter.label}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <button type="button" onClick={clearFilters} className={buttonStyles.secondary}>
                    Изчисти всички
                  </button>
                </div>
              ) : null}

              {filteredProducts.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      brandName={brandById.get(product.brandId)?.name ?? product.brandId}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[32px] border border-dashed border-[rgba(12,140,233,0.18)] bg-white px-6 py-16 text-center shadow-[var(--shadow-card)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--primary)]">
                    <SearchX className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight">
                    Няма продукти по тези критерии
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--gray-600)]">
                    Пробвай да изчистиш филтрите, да разшириш ценовия диапазон или да разгледаш друга подкатегория в отдела.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={clearFilters} className={buttonStyles.primary}>
                      <RotateCcw className="h-4 w-4" />
                      Изчисти филтрите
                    </button>
                    <Link href="/categories" className={buttonStyles.secondary}>
                      <span>Виж всички категории</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[30px] border border-[rgba(12,140,233,0.1)] bg-white p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                SEO &amp; buying guide
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Какво да гледаш при избор на {category.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--gray-600)]">
                {getSeoCopy(category, parentCategory)}
              </p>
            </div>

            <div className="rounded-[30px] border border-[rgba(12,140,233,0.1)] bg-white p-6 shadow-[var(--shadow-card)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--blue-100)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue-900)]">
                <Info className="h-4 w-4" />
                Нужда от насока
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Помощ при избор и поръчка</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--gray-600)]">
                Ако сравняваш няколко модела, използвай филтрите за марка, рейтинг и наличност, а после виж dispatch и stock сигналите в самите карти.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--gray-50)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-600)]">
                <PhoneCall className="h-4 w-4 text-[var(--primary)]" />
                Телефон и имейл поддръжка
              </div>
              <div className="mt-4 text-sm font-semibold text-[var(--gray-900)]">
                {siteSettingsData.contact.phone}
              </div>
              <div className="mt-1 text-sm text-[var(--gray-500)]">{siteSettingsData.contact.email}</div>
              <div className="mt-1 text-sm text-[var(--gray-500)]">{siteSettingsData.contact.supportHours}</div>
              <div className="mt-3 text-xs leading-6 text-[var(--gray-500)]">
                Стандартните поръчки са с ясен процес за съдействие, връщане и замяна, ако трябва да коригираш setup-а след покупката.
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <FilterPanel
          activeFilterCount={activeFilters.length}
          relevantBrands={relevantBrands}
          products={products}
          filterConfig={filterConfig}
          selectedBrandIds={selectedBrandIds}
          selectedAvailabilityIds={selectedAvailabilityIds}
          selectedRatingId={selectedRatingId}
          selectedPriceMin={selectedPriceMin}
          selectedPriceMax={selectedPriceMax}
          priceBounds={priceBounds}
          derivedFacetSections={derivedFacetSections}
          selectedSpecFilters={selectedSpecFilters}
          expandedFacetIds={expandedFacetIds}
          onToggleBrand={(brandId) =>
            setSelectedBrandIds((current) =>
              current.includes(brandId)
                ? current.filter((value) => value !== brandId)
                : [...current, brandId],
            )
          }
          onToggleAvailability={(availabilityId) =>
            setSelectedAvailabilityIds((current) =>
              current.includes(availabilityId)
                ? current.filter((value) => value !== availabilityId)
                : [...current, availabilityId],
            )
          }
          onSelectRating={(ratingId) =>
            setSelectedRatingId((current) => (current === ratingId ? null : ratingId))
          }
          onPriceMinChange={setSelectedPriceMin}
          onPriceMaxChange={setSelectedPriceMax}
          onToggleFacetExpansion={(facetId) =>
            setExpandedFacetIds((current) =>
              current.includes(facetId)
                ? current.filter((value) => value !== facetId)
                : [...current, facetId],
            )
          }
          onToggleSpecValue={(specName, value) =>
            setSelectedSpecFilters((current) => {
              const currentValues = current[specName] ?? [];

              return {
                ...current,
                [specName]: currentValues.includes(value)
                  ? currentValues.filter((item) => item !== value)
                  : [...currentValues, value],
              };
            })
          }
          onClear={clearFilters}
        />
      </MobileFilterDrawer>
    </div>
  );
}

function ProductCard({
  product,
  brandName,
}: {
  product: Product;
  brandName: string;
}) {
  const { addItem } = useCart();
  const image = resolveProductImage(product);
  const availabilityMeta = getAvailabilityMeta(product.availability, product.stock, "bg");
  const dispatchLabel = getDispatchLabel(
    product.shipping,
    product.availability,
    product.stock.nextRestockDate,
    "bg",
  );
  const savingsPercent = getSavingsPercent(product.price, product.oldPrice);
  const savingsAmount = getSavingsAmount(product.price, product.oldPrice);
  const canAddToCart =
    product.stock.quantity > 0 &&
    product.availability !== "out_of_stock" &&
    product.availability !== "discontinued";

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[rgba(12,140,233,0.1)] bg-white shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_22px_45px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[linear-gradient(180deg,#f8fbff,#ebf5ff)]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain p-5 transition duration-300 group-hover:scale-105"
        />
        {product.badges.length > 0 || savingsPercent ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getBadgeClasses(badge)}`}
              >
                {humanizeBadge(badge, "bg")}
              </span>
            ))}
            {savingsPercent ? (
              <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                -{savingsPercent}%
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                Марка
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                {brandName}
              </div>
            </div>
            <div className="rounded-full bg-[var(--gray-100)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--gray-500)]">
              {product.sku}
            </div>
          </div>
          <h2 className="mt-3 min-h-[3.5rem] line-clamp-2 text-xl font-black tracking-tight">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--gray-600)]">
            {product.shortDescription}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--gray-600)]">
            <span className="rounded-full bg-[var(--gray-100)] px-3 py-1.5">
              {availabilityMeta.detail}
            </span>
            <span className="rounded-full bg-[var(--gray-100)] px-3 py-1.5">
              {product.shipping.freeShippingEligible
                ? "Безплатна доставка"
                : "Доставка според размер"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={availabilityToneClass(availabilityMeta.tone)}>
            {availabilityMeta.label}
          </span>
          <span className="rounded-full bg-[var(--gray-100)] px-3 py-1.5 text-[var(--gray-600)]">
            {dispatchLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
          <Star className="h-4 w-4 fill-[var(--warning)] text-[var(--warning)]" />
          <span className="font-semibold text-[var(--gray-900)]">{product.rating.toFixed(1)}</span>
          <span>({formatCount(product.reviewCount)} ревюта)</span>
        </div>

        <div className="grid gap-2 rounded-2xl bg-[var(--gray-50)] p-3 text-sm text-[var(--gray-600)]">
          {product.specs.slice(0, 3).map((spec) => (
            <div key={`${product.id}-${spec.name}`} className="flex justify-between gap-4">
              <span>{spec.name}</span>
              <span className="text-right font-semibold text-[var(--gray-900)]">
                {spec.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            {product.oldPrice ? (
              <div className="text-sm text-[var(--gray-500)] line-through">
                {formatEuro(product.oldPrice)}
              </div>
            ) : null}
            <div className="flex flex-wrap items-end gap-2">
              <div className="text-3xl font-black tracking-tight">{formatEuro(product.price)}</div>
              {savingsAmount ? (
                <span className="pb-1 text-xs font-semibold text-[var(--primary)]">
                  Спестяваш {formatEuro(savingsAmount)}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--gray-400)]">
              Онлайн цена с ДДС
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-[11rem]">
            <button
              type="button"
              disabled={!canAddToCart}
              onClick={() =>
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  brand: brandName,
                  image,
                  price: product.price,
                  maxQuantity: product.stock.quantity,
                  externalUrl: product.externalUrl,
                })
              }
              className={cx(
                buttonStyles.primary,
                "w-full",
                !canAddToCart &&
                  "cursor-not-allowed border border-[var(--border)] bg-[var(--gray-200)] text-[var(--gray-500)] shadow-none hover:bg-[var(--gray-200)]",
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {canAddToCart ? "Добави в количката" : "Провери наличност"}
            </button>
            {product.externalUrl ? (
              <a
                href={product.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-center text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
              >
                Виж източник
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

void ProductCard;

function ProductRow({
  product,
  brandName,
}: {
  product: Product;
  brandName: string;
}) {
  const { addItem } = useCart();
  const image = resolveProductImage(product);
  const availabilityMeta = getAvailabilityMeta(product.availability, product.stock, "bg");
  const dispatchLabel = getDispatchLabel(
    product.shipping,
    product.availability,
    product.stock.nextRestockDate,
    "bg",
  );
  const savingsPercent = getSavingsPercent(product.price, product.oldPrice);
  const savingsAmount = getSavingsAmount(product.price, product.oldPrice);
  const canAddToCart =
    product.stock.quantity > 0 &&
    product.availability !== "out_of_stock" &&
    product.availability !== "discontinued";
  const productTitle = getProductTitleWithoutBrand(product.name, brandName);
  const featureLines = [
    product.shortDescription,
    ...product.specs.slice(0, 3).map((spec) => `${translateSpecTitle(spec.name)}: ${spec.value}`),
  ].slice(0, 4);
  const merchandisingLabel = getMerchandisingLabel(product, savingsPercent);

  return (
    <article className="group rounded-[18px] border border-[#dfdfdf] bg-[#f4f4f4] p-4 transition duration-150 hover:border-[#cfcfcf] hover:bg-[#f7f7f7]">
      <div className="grid gap-5 sm:grid-cols-[170px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)_150px]">
        <div className="relative min-h-[152px] rounded-[12px] bg-transparent">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 170px, 200px"
            className="object-contain p-3"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4 lg:hidden">
            <ListingPriceBlock
              price={product.price}
              oldPrice={product.oldPrice}
              savingsAmount={savingsAmount}
              align="left"
            />
            {merchandisingLabel ? <ListingBadge label={merchandisingLabel} /> : null}
          </div>

          <h2 className="text-[1.15rem] leading-6 text-[var(--gray-900)]">
            <span className="font-black">{brandName}</span>{" "}
            <span className="font-medium text-[var(--gray-700)]">{productTitle}</span>
          </h2>

          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--gray-600)]">
            <div className="flex items-center gap-0.5 text-[var(--gray-900)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${product.id}-star-${index}`}
                  className={`h-4 w-4 ${
                    index < Math.round(product.rating)
                      ? "fill-[var(--gray-900)] text-[var(--gray-900)]"
                      : "fill-transparent text-[var(--gray-300)]"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-[var(--gray-700)]">
              {formatCount(product.reviewCount)}
            </span>
          </div>

          <ul className="mt-3 space-y-1 text-[15px] leading-7 text-[var(--gray-700)]">
            {featureLines.map((line) => (
              <li key={`${product.id}-${line}`} className="flex gap-3">
                <span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-[var(--gray-900)]" />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className={cx("inline-flex items-center gap-2", availabilityTextTone(availabilityMeta.tone))}>
              <span className={availabilityDotClass(availabilityMeta.tone)} />
              <span>{availabilityMeta.label}</span>
            </span>
            <span className="text-[var(--gray-500)]">{dispatchLabel}</span>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:justify-between lg:border-l lg:border-[#dedede] lg:pl-4">
          <div className="flex justify-end">
            {merchandisingLabel ? <ListingBadge label={merchandisingLabel} /> : null}
          </div>

          <ListingPriceBlock
            price={product.price}
            oldPrice={product.oldPrice}
            savingsAmount={savingsAmount}
            align="right"
          />

          <div className="flex items-center justify-end gap-3">
            {product.externalUrl ? (
              <a
                href={product.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-700)] transition hover:border-[var(--gray-900)] hover:text-[var(--gray-900)]"
                aria-label="Product source"
              >
                <ArrowUpRight className="h-5 w-5" />
              </a>
            ) : null}

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-700)] transition hover:border-[var(--gray-900)] hover:text-[var(--gray-900)]"
              aria-label="Save product"
            >
              <Heart className="h-5 w-5" />
            </button>

            <button
              type="button"
              disabled={!canAddToCart}
              onClick={() =>
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  brand: brandName,
                  image,
                  price: product.price,
                  maxQuantity: product.stock.quantity,
                  externalUrl: product.externalUrl,
                })
              }
              className={cx(
                "inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-900)] transition hover:border-[var(--gray-900)] hover:bg-[var(--gray-900)] hover:text-white",
                !canAddToCart &&
                  "cursor-not-allowed border-[var(--border)] bg-[var(--gray-200)] text-[var(--gray-500)] hover:bg-[var(--gray-200)] hover:text-[var(--gray-500)]",
              )}
              aria-label={canAddToCart ? "Add to cart" : "Unavailable"}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#dfdfdf] pt-4 lg:hidden">
        {product.externalUrl ? (
          <a
            href={product.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-700)] transition hover:border-[var(--gray-900)] hover:text-[var(--gray-900)]"
            aria-label="Product source"
          >
            <ArrowUpRight className="h-5 w-5" />
          </a>
        ) : null}

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-700)] transition hover:border-[var(--gray-900)] hover:text-[var(--gray-900)]"
          aria-label="Save product"
        >
          <Heart className="h-5 w-5" />
        </button>

        <button
          type="button"
          disabled={!canAddToCart}
          onClick={() =>
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: brandName,
              image,
              price: product.price,
              maxQuantity: product.stock.quantity,
              externalUrl: product.externalUrl,
            })
          }
          className={cx(
            "inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white text-[var(--gray-900)] transition hover:border-[var(--gray-900)] hover:bg-[var(--gray-900)] hover:text-white",
            !canAddToCart &&
              "cursor-not-allowed border-[var(--border)] bg-[var(--gray-200)] text-[var(--gray-500)] hover:bg-[var(--gray-200)] hover:text-[var(--gray-500)]",
          )}
          aria-label={canAddToCart ? "Add to cart" : "Unavailable"}
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function getProductTitleWithoutBrand(productName: string, brandName: string) {
  if (productName.toLowerCase().startsWith(brandName.toLowerCase())) {
    return productName.slice(brandName.length).trim();
  }

  return productName;
}

function getMerchandisingLabel(product: Product, savingsPercent: number | null) {
  if (product.bestseller) {
    return "TOP SELLER";
  }

  if (product.badges.includes("new")) {
    return "NEW";
  }

  if (product.badges.includes("deal") || savingsPercent) {
    return "DEAL";
  }

  return null;
}

function ListingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-[6px] bg-[#6d28d9] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
      {label}
    </span>
  );
}

function ListingPriceBlock({
  price,
  oldPrice,
  savingsAmount,
  align,
}: {
  price: number;
  oldPrice?: number | null;
  savingsAmount: number | null;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      {oldPrice ? (
        <div className="text-sm text-[var(--gray-500)] line-through">{formatEuro(oldPrice)}</div>
      ) : null}
      <div className="text-[2rem] font-black leading-none tracking-tight text-[var(--gray-900)]">
        {formatEuro(price)}
      </div>
      {savingsAmount ? (
        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">
          Save {formatEuro(savingsAmount)}
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({
  activeFilterCount,
  relevantBrands,
  products,
  filterConfig,
  selectedBrandIds,
  selectedAvailabilityIds,
  selectedRatingId,
  selectedPriceMin,
  selectedPriceMax,
  priceBounds,
  derivedFacetSections,
  selectedSpecFilters,
  expandedFacetIds,
  onToggleBrand,
  onToggleAvailability,
  onSelectRating,
  onPriceMinChange,
  onPriceMaxChange,
  onToggleFacetExpansion,
  onToggleSpecValue,
  onClear,
}: {
  activeFilterCount: number;
  relevantBrands: Brand[];
  products: Product[];
  filterConfig: FilterConfig;
  selectedBrandIds: string[];
  selectedAvailabilityIds: string[];
  selectedRatingId: string | null;
  selectedPriceMin: number | null;
  selectedPriceMax: number | null;
  priceBounds: { min: number; max: number };
  derivedFacetSections: DerivedFacetSection[];
  selectedSpecFilters: Record<string, string[]>;
  expandedFacetIds: string[];
  onToggleBrand: (brandId: string) => void;
  onToggleAvailability: (availabilityId: string) => void;
  onSelectRating: (ratingId: string) => void;
  onPriceMinChange: (value: number | null) => void;
  onPriceMaxChange: (value: number | null) => void;
  onToggleFacetExpansion: (facetId: string) => void;
  onToggleSpecValue: (specName: string, value: string) => void;
  onClear: () => void;
}) {
  const currentMin = selectedPriceMin ?? priceBounds.min;
  const currentMax = selectedPriceMax ?? priceBounds.max;
  const rangeSize = Math.max(priceBounds.max - priceBounds.min, 1);
  const minPercent = ((currentMin - priceBounds.min) / rangeSize) * 100;
  const maxPercent = ((currentMax - priceBounds.min) / rangeSize) * 100;

  return (
    <div className="lg:sticky lg:top-28 lg:border-r lg:border-[var(--border)] lg:pr-6">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Shop filters
          </div>
          <h2 className="text-lg font-bold tracking-tight">Филтри</h2>
          <p className="hidden mt-2 text-sm text-[var(--gray-600)]">
            Прецизирай каталога по марка, цена, рейтинг и наличност.
          </p>
        </div>
        <button type="button" onClick={onClear} className={buttonStyles.ghost}>
          {activeFilterCount > 0 ? `Изчисти (${activeFilterCount})` : "Изчисти"}
        </button>
      </div>

      <div className="space-y-7 pt-6">
        <FilterSection title="Производител">
          {relevantBrands.map((brand) => (
            <label key={brand.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() => onToggleBrand(brand.id)}
                  className="h-5 w-5 appearance-none border border-[var(--border-strong)] bg-white checked:border-[var(--gray-900)] checked:bg-[var(--gray-900)]"
                />
                <span>{brand.name}</span>
              </span>
              <span className="text-[var(--gray-500)]">
                ({products.filter((product) => product.brandId === brand.id).length})
              </span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Ценови диапазон">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--gray-500)]">
                От (€)
              </span>
              <input
                type="number"
                value={selectedPriceMin ?? ""}
                min={priceBounds.min}
                max={currentMax}
                onChange={(event) =>
                  onPriceMinChange(event.target.value ? Number(event.target.value) : null)
                }
                className="w-full rounded-lg border border-[var(--border-strong)] bg-white px-3 py-3 text-sm font-semibold outline-none"
              />
            </label>
            <span className="pb-3 text-xl text-[var(--gray-500)]">-</span>
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--gray-500)]">
                До (€)
              </span>
              <input
                type="number"
                value={selectedPriceMax ?? ""}
                min={currentMin}
                max={priceBounds.max}
                onChange={(event) =>
                  onPriceMaxChange(event.target.value ? Number(event.target.value) : null)
                }
                className="w-full rounded-lg border border-[var(--border-strong)] bg-white px-3 py-3 text-sm font-semibold outline-none"
              />
            </label>
          </div>
          <div className="pt-3">
            <div className="relative h-8">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-[var(--gray-300)]" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 bg-[var(--gray-900)]"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <span
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 border-2 border-white bg-[var(--gray-900)] shadow-sm"
                style={{ left: `${minPercent}%` }}
              />
              <span
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 border-2 border-white bg-[var(--gray-900)] shadow-sm"
                style={{ left: `${maxPercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[var(--gray-500)]">
              {formatRangeLabel(currentMin, currentMax)}
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Рейтинг">
          {filterConfig.rating.map((rating) => (
            <label key={rating.id} className="flex items-center justify-between gap-3 text-sm text-[var(--gray-700)]">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRatingId === rating.id}
                  onChange={() => onSelectRating(rating.id)}
                  className="h-5 w-5 appearance-none border border-[var(--border-strong)] bg-white checked:border-[var(--gray-900)] checked:bg-[var(--gray-900)]"
                />
                <span>{translateFilterLabel(rating.label)}</span>
              </span>
              <span className="text-[var(--gray-500)]">
                ({products.filter((product) => product.rating >= rating.minRating).length})
              </span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Наличност">
          {filterConfig.availability.map((availability) => (
            <label key={availability.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAvailabilityIds.includes(availability.id)}
                  onChange={() => onToggleAvailability(availability.id)}
                  className="h-5 w-5 appearance-none border border-[var(--border-strong)] bg-white checked:border-[var(--gray-900)] checked:bg-[var(--gray-900)]"
                />
                <span>{translateFilterLabel(availability.label)}</span>
              </span>
              <span className="text-[var(--gray-500)]">
                ({
                  products.filter((product) =>
                    availability.values.includes(product.availability),
                  ).length
                })
              </span>
            </label>
          ))}
        </FilterSection>

        {derivedFacetSections.map((section) => {
          const isExpanded = expandedFacetIds.includes(section.id);

          return (
            <ExpandableFilterSection
              key={section.id}
              title={section.title}
              expanded={isExpanded}
              onToggle={() => onToggleFacetExpansion(section.id)}
            >
              {section.options.slice(0, 6).map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between gap-3 text-sm text-[var(--gray-700)]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={(selectedSpecFilters[section.specName] ?? []).includes(option.value)}
                      onChange={() => onToggleSpecValue(section.specName, option.value)}
                      className="h-5 w-5 appearance-none border border-[var(--border-strong)] bg-white checked:border-[var(--gray-900)] checked:bg-[var(--gray-900)]"
                    />
                    <span className="truncate">{option.value}</span>
                  </span>
                  <span className="text-[var(--gray-500)]">({option.count})</span>
                </label>
              ))}
            </ExpandableFilterSection>
          );
        })}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border)] pb-6">
      <h3 className="mb-4 text-[1.05rem] font-bold tracking-tight text-[var(--gray-900)]">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function ExpandableFilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border)] pb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-[1.05rem] font-bold tracking-tight text-[var(--gray-900)]"
      >
        <span>{title}</span>
        {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      {expanded ? <div className="mt-4 space-y-2.5">{children}</div> : null}
    </section>
  );
}

function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-white p-4 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-black tracking-tight">Филтри</div>
          <button type="button" onClick={onClose} className={buttonStyles.icon}>
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90">
      {icon}
      {label}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function CatalogCue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(12,140,233,0.1)] bg-[var(--gray-50)] px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--gray-900)]">{value}</div>
    </div>
  );
}

function availabilityTextTone(tone: "success" | "warning" | "neutral" | "danger") {
  if (tone === "success") {
    return "text-[var(--success)]";
  }

  if (tone === "warning") {
    return "text-[var(--warning)]";
  }

  if (tone === "danger") {
    return "text-[var(--error)]";
  }

  return "text-[var(--gray-600)]";
}

function availabilityDotClass(tone: "success" | "warning" | "neutral" | "danger") {
  if (tone === "success") {
    return "h-2.5 w-2.5 rounded-full bg-[var(--success)]";
  }

  if (tone === "warning") {
    return "h-2.5 w-2.5 rounded-full bg-[var(--warning)]";
  }

  if (tone === "danger") {
    return "h-2.5 w-2.5 rounded-full bg-[var(--error)]";
  }

  return "h-2.5 w-2.5 rounded-full bg-[var(--gray-400)]";
}

function availabilityToneClass(tone: "success" | "warning" | "neutral" | "danger") {
  if (tone === "success") {
    return "rounded-full bg-[var(--success-soft)] px-3 py-1.5 font-semibold text-[var(--success)]";
  }

  if (tone === "warning") {
    return "rounded-full bg-[rgba(245,158,11,0.14)] px-3 py-1.5 font-semibold text-[var(--warning)]";
  }

  if (tone === "neutral") {
    return "rounded-full bg-[var(--gray-100)] px-3 py-1.5 font-semibold text-[var(--gray-600)]";
  }

  return "rounded-full bg-[var(--error-soft)] px-3 py-1.5 font-semibold text-[var(--error)]";
}
