"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Filter,
  Search,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useDeferredValue, useState, type ReactNode } from "react";

import { CartButton, useCart } from "@/components/cart-provider";
import type { Brand, FilterConfig, Product, SortOptionId } from "@/types/ecommerce";

interface PoweredMixersPageProps {
  products: Product[];
  brands: Brand[];
  filterConfig: FilterConfig;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatRangeLabel(min: number, max: number | null) {
  if (max === null) {
    return `${formatCurrency(min)}+`;
  }

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
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

  const clearFilters = () => {
    setSelectedBrandIds([]);
    setSelectedAvailabilityIds([]);
    setSelectedRatingId(null);
    setSelectedPriceRangeId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)] text-[var(--gray-900)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-black italic text-white">
              M
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">MusicWorld</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--primary)]">
                powered mixers
              </div>
            </div>
          </Link>

          <div className="hidden max-w-xl flex-1 md:block">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Търси модел, марка или спецификация"
            />
          </div>

          <CartButton />
        </div>

        <div className="px-4 pb-4 sm:px-6 lg:hidden">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Търси модел, марка или спецификация"
          />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--gray-900)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#21548a,transparent_35%),radial-gradient(circle_at_bottom_right,#0c8ce9,transparent_25%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8dcbff]">
                Thomann-style category
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                Powered mixers за банди, училища и мобилни PA системи
              </h1>
              <p className="mt-5 text-base leading-7 text-white/80 md:text-lg">
                Всички продукти са локални JSON записи, а филтрите и количката работят
                изцяло във frontend слоя. Данните са подготвени за по-късна замяна с API.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrustChip icon={<Truck className="h-4 w-4" />} label="Локален catalog layer" />
                <TrustChip icon={<ShoppingBag className="h-4 w-4" />} label="Работещ cart drawer" />
                <TrustChip icon={<Filter className="h-4 w-4" />} label="Филтри по марка, цена и рейтинг" />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="grid gap-4 min-[520px]:grid-cols-3 lg:grid-cols-1">
                <Metric label="Артикули" value={String(products.length)} />
                <Metric label="Марки" value={String(relevantBrands.length)} />
                <Metric label="Диапазон" value={`${formatCurrency(Math.min(...products.map((product) => product.price)))}+`} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <FilterPanel
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
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                    Филтри
                  </button>
                  <div className="text-sm text-[var(--gray-600)]">
                    <span className="font-semibold text-[var(--gray-900)]">
                      {filteredProducts.length}
                    </span>{" "}
                    резултата
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOptionId)}
                    className="appearance-none rounded-full border border-[var(--border-strong)] bg-[var(--gray-50)] py-2 pl-4 pr-10 text-sm font-semibold outline-none"
                  >
                    {filterConfig.sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-500)]" />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      brandName={brandById.get(product.brandId)?.name ?? product.brandId}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[32px] border border-dashed border-[var(--border-strong)] bg-white px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--primary)]">
                    <Filter className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight">
                    Няма продукти по тези критерии
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--gray-600)]">
                    Пробвай да изчистиш филтрите или промени търсенето.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <FilterPanel
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

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-[var(--primary)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[linear-gradient(180deg,#f8fafc,#eef2f7)]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain p-5 transition duration-300 group-hover:scale-105"
        />
        {product.badges.length > 0 ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gray-700)]"
              >
                {badge.replaceAll("-", " ")}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            {brandName}
          </div>
          <h2 className="mt-2 text-xl font-black tracking-tight">{product.name}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--gray-600)]">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
          <Star className="h-4 w-4 fill-[var(--warning)] text-[var(--warning)]" />
          <span className="font-semibold text-[var(--gray-900)]">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
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
                {formatCurrency(product.oldPrice)}
              </div>
            ) : null}
            <div className="text-3xl font-black tracking-tight">
              {formatCurrency(product.price)}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-42">
            <button
              type="button"
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
              className="rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Добави в количката
            </button>
            {product.externalUrl ? (
              <a
                href={product.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-center text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
              >
                Източник
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function FilterPanel({
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
    <div className="sticky top-28 rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Filters
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Филтри</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-[var(--primary)]"
        >
          Изчисти
        </button>
      </div>

      <div className="space-y-6">
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
              label={rating.label}
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
                <span>{availability.label}</span>
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
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--border-strong)] bg-[var(--gray-50)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
      />
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
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
    <section>
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
          : "border-[var(--border)] bg-[var(--gray-50)] text-[var(--gray-700)] hover:border-[var(--primary)]"
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
        className={`fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-white p-4 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-black tracking-tight">Филтри</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
          >
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
