"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Filter,
  Info,
  PhoneCall,
  RotateCcw,
  SearchX,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useDeferredValue, useState, type ReactNode } from "react";

import { useCart } from "@/components/cart-provider";
import { HomeFooter, HomeHeader } from "@/components/home-shell";
import siteSettingsData from "@/data/site-settings.json";
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
import type { Locale } from "@/lib/storefront-data";
import type { Brand, FilterConfig, Product, SortOptionId } from "@/types/ecommerce";

interface PoweredMixersPageProps {
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

export default function PoweredMixersPage({
  products,
  brands,
  filterConfig,
}: PoweredMixersPageProps) {
  const [locale, setLocale] = useState<Locale>("bg");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOptionId>("most-popular");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedAvailabilityIds, setSelectedAvailabilityIds] = useState<string[]>([]);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const relevantBrands = brands.filter((brand) =>
    products.some((product) => product.brandId === brand.id),
  );
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const selectedPriceRange =
    filterConfig.priceRanges.find((range) => range.id === selectedPriceRangeId) ?? null;
  const selectedRating =
    filterConfig.rating.find((rating) => rating.id === selectedRatingId) ?? null;
  const selectedAvailabilityValues = filterConfig.availability
    .filter((option) => selectedAvailabilityIds.includes(option.id))
    .flatMap((option) => option.values);
  const inStockCount = products.filter((product) =>
    ["in_stock", "low_stock"].includes(product.availability),
  ).length;
  const bestsellingCount = products.filter((product) => product.bestseller).length;
  const topBrands = [...relevantBrands]
    .sort(
      (left, right) =>
        products.filter((product) => product.brandId === right.id).length -
        products.filter((product) => product.brandId === left.id).length,
    )
    .slice(0, 4);

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

      if (selectedPriceRange) {
        const insideMin = product.price >= selectedPriceRange.min;
        const insideMax =
          selectedPriceRange.max === null || product.price <= selectedPriceRange.max;

        if (!insideMin || !insideMax) {
          return false;
        }
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

      return true;
    }),
    sortBy,
  );
  const filteredBrandCount = new Set(filteredProducts.map((product) => product.brandId)).size;
  const dealCount = filteredProducts.filter(
    (product) =>
      product.badges.includes("deal") ||
      (typeof product.oldPrice === "number" && product.oldPrice > product.price),
  ).length;
  const activeFilterCount =
    selectedBrandIds.length +
    selectedAvailabilityIds.length +
    Number(Boolean(selectedRatingId)) +
    Number(Boolean(selectedPriceRangeId)) +
    Number(Boolean(normalizedSearch));

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
    ...(selectedPriceRange
      ? [
          {
            id: `price-${selectedPriceRange.id}`,
            label: formatRangeLabel(selectedPriceRange.min, selectedPriceRange.max),
            onRemove: () => setSelectedPriceRangeId(null),
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
  ];

  const clearFilters = () => {
    setSelectedBrandIds([]);
    setSelectedAvailabilityIds([]);
    setSelectedRatingId(null);
    setSelectedPriceRangeId(null);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <HomeHeader
        locale={locale}
        searchValue={search}
        onSearchChange={setSearch}
        onLocaleToggle={() => setLocale((current) => (current === "bg" ? "en" : "bg"))}
        searchPlaceholder="Search model, brand or specification"
      />

      <main>
                <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--gray-500)]">
            <Link href="/" className="transition hover:text-[var(--gray-900)]">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
            <Link href="/categories" className="transition hover:text-[var(--gray-900)]">
              Categories
            </Link>
            <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
            <span className="text-[var(--gray-900)]">Powered Mixers</span>
          </nav>

          <div className="mt-3 rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Powered Mixers</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--gray-600)]">
              Compact all-in-one powered mixers for rehearsal rooms, schools and small live setups.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--gray-600)]">
              <span className="rounded-full border border-[var(--border)] bg-[var(--gray-50)] px-3 py-1.5">
                {formatCount(products.length)} products
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--gray-50)] px-3 py-1.5">
                {formatCount(relevantBrands.length)} brands
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--gray-50)] px-3 py-1.5">
                {formatCount(inStockCount)} in stock
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--gray-50)] px-3 py-1.5">
                Free shipping over {formatEuro(freeShippingThreshold)}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-4 rounded-[30px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] p-5 shadow-[var(--shadow-card)] lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Category overview
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                По-бърз избор за мобилни PA системи, училища и малки сцени
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--gray-600)]">
                Powered mixers са практичен all-in-one избор, когато искаш по-бърз setup, по-малко отделни устройства и
                ясен контрол над озвучаването. Тук сме подредили моделите по марка, цена, рейтинг и наличност, така че
                да стигнеш по-бързо до правилния вариант.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <CatalogCue
                label="Водещи марки"
                value={topBrands.map((brand) => brand.name).join(", ")}
              />
              <CatalogCue
                label="Бестселъри"
                value={`${formatCount(bestsellingCount)} модела с висок интерес`}
              />
              <CatalogCue
                label="Подредба"
                value="Филтри, ревюта и ценови диапазони за по-ясно сравнение"
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <FilterPanel
                activeFilterCount={activeFilterCount}
                relevantBrands={relevantBrands}
                products={products}
                filterConfig={filterConfig}
                selectedBrandIds={selectedBrandIds}
                selectedAvailabilityIds={selectedAvailabilityIds}
                selectedRatingId={selectedRatingId}
                selectedPriceRangeId={selectedPriceRangeId}
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
                onSelectPriceRange={(rangeId) =>
                  setSelectedPriceRangeId((current) => (current === rangeId ? null : rangeId))
                }
                onClear={clearFilters}
              />
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] px-4 py-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold lg:hidden"
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
                    резултата
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
                    Sort
                  </div>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOptionId)}
                    className="appearance-none rounded-full border border-[rgba(230,120,23,0.18)] bg-[var(--gray-50)] py-2 pl-14 pr-10 text-sm font-semibold outline-none"
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
                  Всички цени са в EUR с ДДС
                </span>
                <span className="rounded-full border border-[rgba(230,120,23,0.12)] bg-white px-3 py-1.5 text-[var(--gray-600)] shadow-[var(--shadow-card)]">
                  Изпращане според наличността и склада
                </span>
                <span className="rounded-full border border-[rgba(230,120,23,0.12)] bg-white px-3 py-1.5 text-[var(--gray-600)] shadow-[var(--shadow-card)]">
                  Консултант по телефон и имейл преди поръчка
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--gray-500)]">
                <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  {formatCount(filteredBrandCount)} Ð¼Ð°Ñ€ÐºÐ¸ Ð² Ñ€ÐµÐ·ÑƒÐ»Ñ‚Ð°Ñ‚Ð¸Ñ‚Ðµ
                </span>
                <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  {formatCount(
                    filteredProducts.filter((product) =>
                      ["in_stock", "low_stock"].includes(product.availability),
                    ).length,
                  )}{" "}
                  Ð½Ð°Ð»Ð¸Ñ‡Ð½Ð¸ Ð¼Ð¾Ð´ÐµÐ»Ð°
                </span>
                <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  {formatCount(dealCount)} Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¸ Ð¾Ñ„ÐµÑ€Ñ‚Ð¸
                </span>
              </div>

              {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[24px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] px-4 py-4 shadow-[var(--shadow-card)]">
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
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2 text-sm font-semibold text-[var(--primary)]"
                  >
                    Изчисти всички
                  </button>
                </div>
              ) : null}

              {filteredProducts.length > 0 ? (
                <div className="mt-6 grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      brandName={brandById.get(product.brandId)?.name ?? product.brandId}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[32px] border border-dashed border-[rgba(230,120,23,0.22)] bg-[#fffdfa] px-6 py-16 text-center shadow-[var(--shadow-card)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--primary)]">
                    <SearchX className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight">
                    Няма продукти по тези критерии
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--gray-600)]">
                    Пробвай да изчистиш филтрите или промени търсенето.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Изчисти филтрите
                    </button>
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--gray-700)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
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
            <div className="rounded-[30px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                SEO &amp; buying guide
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Как да избереш powered mixer за малка сцена или мобилна PA система
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--gray-600)]">
                При избор на powered mixer гледай броя входове, реалната мощност към пасивните колони, наличието на
                вградени ефекти, monitor send и колко лесно ще интегрираш микрофони, инструменти и playback източници в
                един по-компактен setup.
              </p>
            </div>

            <div className="rounded-[30px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] p-6 shadow-[var(--shadow-card)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--blue-100)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue-900)]">
                <Info className="h-4 w-4" />
                Нужда от насока
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Помощ при избор и поръчка</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--gray-600)]">
                Ако сравняваш модели за училище, rehearsal room или малък venue, използвай филтрите за марка, рейтинг и
                наличност, а после провери dispatch и stock сигналите в самите карти.
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
                Стандартните поръчки са с ясен процес за съдействие, връщане и замяна, ако трябва да коригираш setup-а
                след покупката.
              </div>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter locale={locale} />

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <FilterPanel
          activeFilterCount={activeFilterCount}
          relevantBrands={relevantBrands}
          products={products}
          filterConfig={filterConfig}
          selectedBrandIds={selectedBrandIds}
          selectedAvailabilityIds={selectedAvailabilityIds}
          selectedRatingId={selectedRatingId}
          selectedPriceRangeId={selectedPriceRangeId}
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
          onSelectPriceRange={(rangeId) =>
            setSelectedPriceRangeId((current) => (current === rangeId ? null : rangeId))
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
  const image = product.images[0]?.src ?? product.metaImage;
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
    <article className="group overflow-hidden rounded-[28px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_22px_45px_rgba(36,28,21,0.16)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[linear-gradient(180deg,#fffaf4,#f1e8dc)]">
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
                ? "Ð‘ÐµÐ·Ð¿Ð»Ð°Ñ‚Ð½Ð° Ð´Ð¾ÑÑ‚Ð°Ð²ÐºÐ°"
                : "Ð”Ð¾ÑÑ‚Ð°Ð²ÐºÐ° ÑÐ¿Ð¾Ñ€ÐµÐ´ Ñ€Ð°Ð·Ð¼ÐµÑ€"}
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
            <div className="mt-1 text-xs text-[var(--gray-500)]">
              {product.shipping.freeShippingEligible
                ? "Безплатна доставка за този артикул"
                : "Доставка според размера и теглото"}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-[10.5rem]">
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
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                canAddToCart
                  ? "bg-[var(--primary)] text-white shadow-[0_12px_24px_rgba(230,120,23,0.22)] hover:bg-[var(--primary-hover)]"
                  : "cursor-not-allowed bg-[var(--gray-200)] text-[var(--gray-500)]"
              }`}
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

        <div className="grid gap-2 rounded-2xl bg-[var(--gray-50)] px-3 py-3 text-xs text-[var(--gray-600)] sm:grid-cols-2">
          <div>
            <div className="font-semibold uppercase tracking-[0.14em] text-[var(--gray-400)]">
              Stock
            </div>
            <div className="mt-1">{availabilityMeta.detail}</div>
          </div>
          <div>
            <div className="font-semibold uppercase tracking-[0.14em] text-[var(--gray-400)]">
              Service
            </div>
            <div className="mt-1">ÐŸÐ¾Ð´Ð´Ñ€ÑŠÐ¶ÐºÐ° Ð¸ ÑÑ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ð¾ Ð²Ñ€ÑŠÑ‰Ð°Ð½Ðµ ÑÐ»ÐµÐ´ Ð¿Ð¾Ñ€ÑŠÑ‡ÐºÐ°</div>
          </div>
        </div>
      </div>
    </article>
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
  selectedPriceRangeId,
  onToggleBrand,
  onToggleAvailability,
  onSelectRating,
  onSelectPriceRange,
  onClear,
}: {
  activeFilterCount: number;
  relevantBrands: Brand[];
  products: Product[];
  filterConfig: FilterConfig;
  selectedBrandIds: string[];
  selectedAvailabilityIds: string[];
  selectedRatingId: string | null;
  selectedPriceRangeId: string | null;
  onToggleBrand: (brandId: string) => void;
  onToggleAvailability: (availabilityId: string) => void;
  onSelectRating: (ratingId: string) => void;
  onSelectPriceRange: (rangeId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="sticky top-28 rounded-[28px] border border-[rgba(230,120,23,0.12)] bg-[#fffdfa] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Filters
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Филтри</h2>
          <p className="mt-2 text-sm text-[var(--gray-600)]">
            Прецизирай каталога по марка, цена, рейтинг и наличност.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-[var(--primary)]"
        >
          {activeFilterCount > 0 ? `Изчисти (${activeFilterCount})` : "Изчисти"}
        </button>
      </div>

      <div className="space-y-7">
        <FilterSection title="Марки">
          {relevantBrands.map((brand) => (
            <label key={brand.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() => onToggleBrand(brand.id)}
                  className="h-4 w-4 rounded border-[var(--border-strong)]"
                />
                <span>{brand.name}</span>
              </span>
              <span className="text-[var(--gray-500)]">
                {products.filter((product) => product.brandId === brand.id).length}
              </span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Цена">
          {filterConfig.priceRanges.map((range) => (
            <FilterButton
              key={range.id}
              active={selectedPriceRangeId === range.id}
              label={formatRangeLabel(range.min, range.max)}
              onClick={() => onSelectPriceRange(range.id)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Рейтинг">
          {filterConfig.rating.map((rating) => (
            <FilterButton
              key={rating.id}
              active={selectedRatingId === rating.id}
              label={translateFilterLabel(rating.label)}
              onClick={() => onSelectRating(rating.id)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Наличност">
          {filterConfig.availability.map((availability) => (
            <label
              key={availability.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAvailabilityIds.includes(availability.id)}
                  onChange={() => onToggleAvailability(availability.id)}
                  className="h-4 w-4 rounded border-[var(--border-strong)]"
                />
                <span>{translateFilterLabel(availability.label)}</span>
              </span>
              <span className="text-[var(--gray-500)]">
                {
                  products.filter((product) =>
                    availability.values.includes(product.availability),
                  ).length
                }
              </span>
            </label>
          ))}
        </FilterSection>
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
    <section className="border-t border-[rgba(230,120,23,0.12)] pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--gray-500)]">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "border-[var(--primary)] bg-[var(--blue-100)] text-[var(--blue-900)]"
          : "border-[rgba(230,120,23,0.12)] bg-[var(--gray-50)] text-[var(--gray-700)] hover:border-[var(--primary)]"
      }`}
    >
      {label}
    </button>
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
        className={`fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-[#fffdfa] p-4 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-black tracking-tight">Филтри</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(230,120,23,0.16)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>
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
    <div className="rounded-2xl border border-[rgba(230,120,23,0.1)] bg-[var(--gray-50)] px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--gray-900)]">{value}</div>
    </div>
  );
}

function availabilityToneClass(tone: "success" | "warning" | "neutral" | "danger") {
  if (tone === "success") {
    return "rounded-full bg-[var(--success-soft)] px-3 py-1.5 font-semibold text-[var(--success)]";
  }

  if (tone === "warning") {
    return "rounded-full bg-[rgba(245,158,11,0.14)] px-3 py-1.5 font-semibold text-[var(--warning)]";
  }

  if (tone === "danger") {
    return "rounded-full bg-[var(--error-soft)] px-3 py-1.5 font-semibold text-[var(--error)]";
  }

  return "rounded-full bg-[var(--gray-100)] px-3 py-1.5 font-semibold text-[var(--gray-700)]";
}
