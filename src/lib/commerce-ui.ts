import type {
  AvailabilityStatus,
  ShippingInfo,
  StockInfo,
} from "@/types/ecommerce";

export type UiLocale = "bg" | "en";

export function formatEuro(amount: number, locale: UiLocale = "bg") {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatCount(value: number, locale: UiLocale = "bg") {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-GB").format(value);
}

export function humanizeBadge(badge: string, locale: UiLocale = "bg") {
  const normalized = badge.trim().toLowerCase();

  const labels: Record<string, { bg: string; en: string }> = {
    deal: { bg: "Оферта", en: "Deal" },
    featured: { bg: "Акцент", en: "Featured" },
    bestseller: { bg: "Бестселър", en: "Bestseller" },
    "best-seller": { bg: "Бестселър", en: "Bestseller" },
    new: { bg: "Ново", en: "New" },
    "new-arrival": { bg: "Ново", en: "New" },
    preorder: { bg: "Поръчка", en: "Pre-order" },
    limited: { bg: "Лимитиран", en: "Limited" },
  };

  return labels[normalized]?.[locale] ?? badge.replaceAll("-", " ");
}

export function getBadgeClasses(badge: string) {
  const normalized = badge.trim().toLowerCase();

  switch (normalized) {
    case "deal":
      return "bg-[var(--primary)] text-white";
    case "bestseller":
    case "best-seller":
      return "bg-[#fff4d6] text-[#8a5a00]";
    case "new":
    case "new-arrival":
      return "bg-[var(--success-soft)] text-[var(--success)]";
    case "preorder":
      return "bg-[var(--blue-100)] text-[var(--blue-900)]";
    case "limited":
      return "bg-[var(--gray-900)] text-white";
    default:
      return "bg-white/90 text-[var(--gray-700)]";
  }
}

export function getSavingsAmount(price: number, oldPrice: number | null | undefined) {
  if (!oldPrice || oldPrice <= price) {
    return null;
  }

  return oldPrice - price;
}

export function getSavingsPercent(price: number, oldPrice: number | null | undefined) {
  const amount = getSavingsAmount(price, oldPrice);

  if (!amount || !oldPrice) {
    return null;
  }

  return Math.round((amount / oldPrice) * 100);
}

export function getAvailabilityMeta(
  availability: AvailabilityStatus,
  stock: StockInfo,
  locale: UiLocale = "bg",
) {
  switch (availability) {
    case "in_stock":
      return {
        label: locale === "bg" ? "В наличност" : "In stock",
        detail:
          locale === "bg"
            ? `${stock.quantity} бр. в склада`
            : `${stock.quantity} pcs ready to ship`,
        tone: "success" as const,
      };
    case "low_stock":
      return {
        label: locale === "bg" ? "Последни бройки" : "Low stock",
        detail:
          locale === "bg"
            ? `${stock.quantity} бр. налични`
            : `${stock.quantity} pcs left`,
        tone: "warning" as const,
      };
    case "preorder":
      return {
        label: locale === "bg" ? "С предварителна поръчка" : "Pre-order",
        detail:
          locale === "bg"
            ? "Очаква нова доставка"
            : "Waiting for next incoming stock",
        tone: "neutral" as const,
      };
    case "out_of_stock":
      return {
        label: locale === "bg" ? "Временно изчерпан" : "Out of stock",
        detail:
          locale === "bg"
            ? "Няма наличност в момента"
            : "Currently unavailable",
        tone: "danger" as const,
      };
    case "discontinued":
    default:
      return {
        label: locale === "bg" ? "Спрян модел" : "Discontinued",
        detail:
          locale === "bg"
            ? "Без нови наличности"
            : "No longer available",
        tone: "danger" as const,
      };
  }
}

export function getDispatchLabel(
  shipping: ShippingInfo,
  availability: AvailabilityStatus,
  nextRestockDate: string | null,
  locale: UiLocale = "bg",
) {
  if ((availability === "preorder" || availability === "out_of_stock") && nextRestockDate) {
    const formattedDate = new Intl.DateTimeFormat(locale === "bg" ? "bg-BG" : "en-GB", {
      day: "numeric",
      month: "short",
    }).format(new Date(nextRestockDate));

    return locale === "bg"
      ? `Следваща доставка около ${formattedDate}`
      : `Expected around ${formattedDate}`;
  }

  if (shipping.estimatedDispatchDays <= 1) {
    return locale === "bg" ? "Изпращане до 24 часа" : "Dispatch within 24 hours";
  }

  return locale === "bg"
    ? `Изпращане до ${shipping.estimatedDispatchDays} дни`
    : `Dispatch in ${shipping.estimatedDispatchDays} days`;
}

export function getFreeShippingProgress(subtotal: number, threshold: number) {
  const safeThreshold = Math.max(0, threshold);
  const remaining = Math.max(0, safeThreshold - subtotal);
  const progress =
    safeThreshold === 0 ? 100 : Math.min(100, Math.round((subtotal / safeThreshold) * 100));

  return {
    remaining,
    progress,
    unlocked: remaining === 0,
  };
}
