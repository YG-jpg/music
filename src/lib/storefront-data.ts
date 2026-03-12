import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";
import homepageData from "@/data/homepage.json";
import musicworldFeedData from "@/data/musicworld-feed.json";
import navigationData from "@/data/navigation.json";
import productsData from "@/data/products.json";
import siteSettingsData from "@/data/site-settings.json";
import {
  categoryImageFallbacks,
  getProductFallbackImage,
} from "@/lib/catalog-image-fallbacks";

import type {
  Brand as CatalogBrand,
  Category as CatalogCategory,
  HomepageData,
  NavigationData,
  Product as CatalogProduct,
  SiteSettings,
} from "@/types/ecommerce";

export type Locale = "bg" | "en";

type LocalizedString = Record<Locale, string>;

export interface Category {
  id: string;
  image: string;
  itemCount: number;
  label: LocalizedString;
}

export interface Product {
  id: string;
  image: string;
  brand: string;
  name: LocalizedString;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  href?: string;
}

export interface Benefit {
  id: string;
  icon: "truck" | "shield" | "support";
  title: LocalizedString;
  text: LocalizedString;
}

export interface Article {
  id: string;
  image: string;
  tag: LocalizedString;
  title: LocalizedString;
  text: LocalizedString;
}

interface FooterGroup {
  title: LocalizedString;
  links: LocalizedString[];
}

const products = productsData as CatalogProduct[];
const categoriesCatalog = categoriesData as CatalogCategory[];
const brandsCatalog = brandsData as CatalogBrand[];
const homepage = homepageData as HomepageData;
const musicworldFeed = musicworldFeedData as {
  generatedAt: string;
  source: string;
  pages: Array<{ id: string; categoryHint: string; url: string; productCount: number }>;
  products: Array<{
    sourcePageId: string;
    categoryHint: string;
    name: string;
    description: string;
    brand: string;
    currentPriceEur: number;
    oldPriceEur: number | null;
    availability: string;
    productUrl: string;
    imageUrl: string | null;
  }>;
};
const navigation = navigationData as NavigationData;
const siteSettings = siteSettingsData as SiteSettings;

const brandById = new Map(brandsCatalog.map((brand) => [brand.id, brand]));
const productById = new Map(products.map((product) => [product.id, product]));

const articleImageFallbacks = {
  guitars: categoryImageFallbacks.guitars,
  studio: categoryImageFallbacks["studio-recording"],
  dj: categoryImageFallbacks["dj-equipment"],
} as const;

const topCategoryConfig = [
  {
    id: "guitars",
    baseCategoryId: "guitars",
    image: categoryImageFallbacks.guitars,
    label: { bg: "Китари", en: "Guitars" },
  },
  {
    id: "keys",
    baseCategoryId: "keyboards",
    image: categoryImageFallbacks.keys,
    label: { bg: "Клавишни", en: "Keys & Pianos" },
  },
  {
    id: "drums",
    baseCategoryId: "drums",
    image: categoryImageFallbacks.drums,
    label: { bg: "Барабани", en: "Drums" },
  },
  {
    id: "studio",
    baseCategoryId: "studio-recording",
    image: categoryImageFallbacks.studio,
    label: { bg: "Студио", en: "Studio" },
  },
  {
    id: "dj",
    baseCategoryId: "dj-equipment",
    image: categoryImageFallbacks.dj,
    label: { bg: "DJ техника", en: "DJ Gear" },
  },
  {
    id: "live",
    baseCategoryId: "pa-live-sound",
    image: categoryImageFallbacks.live,
    label: { bg: "Озвучаване", en: "Live Sound" },
  },
  {
    id: "accessories",
    baseCategoryId: "accessories",
    image: categoryImageFallbacks.accessories,
    label: { bg: "Аксесоари", en: "Accessories" },
  },
  {
    id: "deals",
    baseCategoryId: null,
    image: categoryImageFallbacks.deals,
    label: { bg: "Оферти", en: "Deals" },
  },
] as const;

export const categories: Category[] = topCategoryConfig.map((item) => {
  if (item.id === "deals") {
    return {
      id: item.id,
      image: item.image,
      itemCount: products.filter(
        (product) => product.active && (product.oldPrice || product.badges.includes("deal")),
      ).length,
      label: item.label,
    };
  }

  const categoryIds = collectDescendantCategoryIds(item.baseCategoryId);
  const itemCount = products.filter(
    (product) =>
      product.active &&
      product.categoryIds.some((categoryId) => categoryIds.includes(categoryId)),
  ).length;

  return {
    id: item.id,
    image: item.image,
    itemCount,
    label: item.label,
  };
});

export const featuredProducts: Product[] = pickProducts({
  preferredIds: homepage.featuredProducts.productIds ?? [],
  fallbackProducts: products.filter((product) => product.active && product.featured),
  limit: 8,
});

export const dealProducts: Product[] = pickProducts({
  preferredIds: homepage.topDeals.productIds ?? [],
  fallbackProducts: products.filter(
    (product) => product.active && (product.oldPrice !== null || product.badges.includes("deal")),
  ),
  limit: 4,
});

export const brands = homepage.brandsStrip.brandIds
  ?.map((brandId) => brandById.get(brandId)?.name)
  .filter((brand): brand is string => Boolean(brand)) ?? [];

export const benefits: Benefit[] = [
  {
    id: "shipping",
    icon: "truck",
    title: {
      bg: `Безплатна доставка над €${siteSettings.shipping.freeShippingThreshold}`,
      en: `Free shipping over EUR ${siteSettings.shipping.freeShippingThreshold}`,
    },
    text: {
      bg: siteSettings.shipping.freeShippingMessage,
      en: "Fast dispatch across Bulgaria for qualifying orders and pro gear setups.",
    },
  },
  {
    id: "warranty",
    icon: "shield",
    title: {
      bg: "Проверени марки и гаранционно обслужване",
      en: "Trusted brands and warranty support",
    },
    text: {
      bg: "Каталогът е подреден така, че по-късно лесно да се свърже с ERP, наличности и сервиз.",
      en: "The catalog is structured for later ERP, stock and service integration without UI rewrites.",
    },
  },
  {
    id: "support",
    icon: "support",
    title: {
      bg: "Подбор за сцена, студио и първи сетъп",
      en: "Guidance for stage, studio and first setups",
    },
    text: {
      bg: "Фронтендът вече е вързан към реален catalog shape вместо към еднократни demo cards.",
      en: "The storefront now reads from a real catalog shape instead of one-off demo cards.",
    },
  },
];

export const articles: Article[] = homepage.guides.slice(0, 3).map((guide) => {
  const key =
    guide.category === "Studio"
      ? "studio"
      : guide.category === "DJ"
        ? "dj"
        : "guitars";

  return {
    id: guide.id,
    image: guide.image.startsWith("/") ? articleImageFallbacks[key] : guide.image,
    tag: {
      bg: translateGuideCategory(guide.category, "bg"),
      en: translateGuideCategory(guide.category, "en"),
    },
    title: {
      bg: guide.title,
      en: guide.title,
    },
    text: {
      bg: guide.description,
      en: guide.description,
    },
  };
});

export const footerGroups: FooterGroup[] = navigation.footerColumns.map((column) => ({
  title: {
    bg: translateFooterLabel(column.title),
    en: column.title,
  },
  links: column.items.map((item) => ({
    bg: translateFooterLabel(item.label),
    en: item.label,
  })),
}));

export const content = {
  bg: {
    localeSwitch: "English",
    shippingMessage: siteSettings.shipping.freeShippingMessage,
    hotlineLabel: "Консултант:",
    hotlineValue: siteSettings.contact.phone,
    supportLink: "Помощ",
    nav: [
      "Китари",
      "Клавишни",
      "Барабани",
      "Студио",
      "DJ",
      "Озвучаване",
      "Аксесоари",
      "Оферти",
    ],
    searchPlaceholder: "Търси инструменти, марки и категории...",
    heroEyebrow: "Frontend-ready storefront data",
    heroTitle: "Музикален магазин с реален каталог и готов data layer",
    heroText:
      "Началната страница вече е вързана към локалните JSON данни за продукти, категории, брандове и homepage секции, без твърдо кодирани продуктови карти.",
    heroPrimary: "Разгледай каталога",
    heroSecondary: "Виж категориите",
    heroHighlights: [
      "Локален JSON source",
      "Готово за API подмяна",
      "EUR цени и наличности",
    ],
    heroStats: [
      { value: "28", label: "seed продукта" },
      { value: "32", label: "категории в йерархия" },
      { value: "12", label: "бранда" },
    ],
    categoriesTitle: "Пазарувай по категории",
    categoriesText: "Витрината е вързана към реалната таксономия, а не към фиктивен списък.",
    dealsTitle: "Топ оферти",
    dealsText: "Секцията се пълни от продуктите с намаление или deal badge в каталога.",
    dealsCta: "Всички оферти",
    featuredTitle: "Подбрани продукти",
    featuredText: "Карти, генерирани от `src/data/products.json` и `src/data/homepage.json`.",
    featuredCta: "Виж всички",
    brandsTitle: "Марки в каталога",
    brandsText: "Взети от локалния brand layer и homepage brand strip секцията.",
    benefitsTitle: "Защо този scaffold вече е usable",
    benefitsText: "UI-то чете от локален source, който после може да се подмени с API adapter.",
    editorialTitle: "Наръчници и идеи",
    editorialText: "Guide секцията е вързана към homepage content layer-а.",
    newsletterTitle: "Имейл блок",
    newsletterText:
      "Оставен е като content-managed секция и не зависи от ERP-like продуктовите данни.",
    newsletterPlaceholder: "Имейл адрес",
    newsletterButton: "Абонирай",
    addToCart: "Добави",
    stock: "Налично",
    outOfStock: "Изчерпано",
    productsLabel: "продукта",
    brandRailLabel: "Активни марки",
    noResultsTitle: "Няма резултати",
    noResultsText: "Опитай с марка, продуктово име или категория като studio или guitars.",
    footerNote: "Данните са локални, но contract-ът е подготвен за ERP/API подмяна.",
    copyright: `© 2026 ${siteSettings.siteName}. Всички права запазени.`,
    mobileNav: {
      home: "Начало",
      search: "Търси",
      saved: "Любими",
      profile: "Профил",
    },
  },
  en: {
    localeSwitch: "Български",
    shippingMessage: siteSettings.shipping.freeShippingMessage,
    hotlineLabel: "Advisor:",
    hotlineValue: siteSettings.contact.phone,
    supportLink: "Support",
    nav: ["Guitars", "Keys", "Drums", "Studio", "DJ", "Live sound", "Accessories", "Deals"],
    searchPlaceholder: "Search instruments, brands and categories...",
    heroEyebrow: "Frontend-ready storefront data",
    heroTitle: "Music retail UI backed by a real catalog shape",
    heroText:
      "The homepage now reads from local JSON data for products, categories, brands and homepage sections instead of hardcoded demo cards.",
    heroPrimary: "Browse catalog",
    heroSecondary: "View categories",
    heroHighlights: ["Local JSON source", "API-ready contracts", "EUR pricing and stock"],
    heroStats: [
      { value: "28", label: "seed products" },
      { value: "32", label: "hierarchical categories" },
      { value: "12", label: "brands" },
    ],
    categoriesTitle: "Shop by category",
    categoriesText: "The storefront now reflects the actual taxonomy instead of a flat demo list.",
    dealsTitle: "Top deals",
    dealsText: "This block is populated from discounted or deal-badged products in the catalog.",
    dealsCta: "All deals",
    featuredTitle: "Featured products",
    featuredText: "Cards generated from `src/data/products.json` and `src/data/homepage.json`.",
    featuredCta: "See all",
    brandsTitle: "Brands in the catalog",
    brandsText: "Derived from the local brand layer and homepage brands strip.",
    benefitsTitle: "Why this scaffold is now usable",
    benefitsText: "The UI reads from a local source that can later be replaced by an API adapter.",
    editorialTitle: "Guides and inspiration",
    editorialText: "The guide section is backed by the homepage content layer.",
    newsletterTitle: "Newsletter block",
    newsletterText:
      "This remains content-managed and intentionally separate from ERP-like product data.",
    newsletterPlaceholder: "Email address",
    newsletterButton: "Subscribe",
    addToCart: "Add",
    stock: "In stock",
    outOfStock: "Out of stock",
    productsLabel: "products",
    brandRailLabel: "Active brands",
    noResultsTitle: "No results found",
    noResultsText: "Try a brand, product name or a category like studio or guitars.",
    footerNote: "The data is local for now, but the contract is ready for ERP/API replacement.",
    copyright: `© 2026 ${siteSettings.siteName}. All rights reserved.`,
    mobileNav: {
      home: "Home",
      search: "Search",
      saved: "Saved",
      profile: "Profile",
    },
  },
} as const;

function pickProducts({
  preferredIds,
  fallbackProducts,
  limit,
}: {
  preferredIds: string[];
  fallbackProducts: CatalogProduct[];
  limit: number;
}) {
  const seen = new Set<string>();
  const prioritized = preferredIds
    .map((id) => productById.get(id))
    .filter((product): product is CatalogProduct => Boolean(product && product.active))
    .filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }

      seen.add(product.id);
      return true;
    })
    .map(toStorefrontProduct);

  const fallback = fallbackProducts
    .filter((product) => !seen.has(product.id))
    .slice(0, limit - prioritized.length)
    .map(toStorefrontProduct);

  return [...prioritized, ...fallback].slice(0, limit);
}

function toStorefrontProduct(product: CatalogProduct): Product {
  const brand = brandById.get(product.brandId)?.name ?? product.brandId;
  const image = resolveProductImage(product);
  const badge = buildBadge(product);

  return {
    id: product.id,
    image,
    brand,
    name: {
      bg: product.name,
      en: product.name,
    },
    price: product.price,
    originalPrice: product.oldPrice ?? undefined,
    rating: product.rating,
    reviews: product.reviewCount,
    inStock: product.availability === "in_stock" || product.availability === "low_stock",
    badge,
  };
}

function resolveProductImage(product: CatalogProduct) {
  const firstImage = product.images[0]?.src;

  if (firstImage?.startsWith("http")) {
    return firstImage;
  }

  return getProductFallbackImage(product);
}

function buildBadge(product: CatalogProduct) {
  if (product.oldPrice && product.oldPrice > product.price) {
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    return `-${discount}%`;
  }

  if (product.badges.includes("new")) {
    return "NEW";
  }

  if (product.badges.includes("premium")) {
    return "PRO";
  }

  return undefined;
}

function collectDescendantCategoryIds(rootId: string | null) {
  if (!rootId) {
    return [];
  }

  const collected = new Set<string>([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId) {
      continue;
    }

    categoriesCatalog
      .filter((category) => category.parentId === currentId)
      .forEach((category) => {
        if (collected.has(category.id)) {
          return;
        }

        collected.add(category.id);
        queue.push(category.id);
      });
  }

  return [...collected];
}

function translateGuideCategory(value: string, locale: Locale) {
  if (locale === "en") {
    return value;
  }

  if (value === "Studio") {
    return "Студио";
  }

  if (value === "DJ") {
    return "DJ";
  }

  return "Китари";
}

function translateFooterLabel(value: string) {
  const translations: Record<string, string> = {
    Shop: "Магазин",
    Support: "Поддръжка",
    Guides: "Наръчници",
    "Electric guitars": "Електрически китари",
    "Digital pianos": "Дигитални пиана",
    "Studio microphones": "Студийни микрофони",
    "Contact us": "Контакти",
    Shipping: "Доставка",
    Returns: "Връщане",
    Warranty: "Гаранция",
    "Guitar buying guide": "Наръчник за китари",
    "Home studio starter": "Старт за домашно студио",
    "DJ beginner path": "Първи стъпки за DJ",
  };

  return translations[value] ?? value;
}

export interface MainCategory {
  id: string;
  image: string;
  itemCount: number;
  label: LocalizedString;
  href: string;
}

export interface ShowcaseProduct {
  id: string;
  image: string;
  brand: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  badge?: string;
  href: string;
}

export interface CategoryShowcase {
  id: string;
  label: LocalizedString;
  eyebrow: LocalizedString;
  description: LocalizedString;
  href: string;
  sourceLabel: LocalizedString;
  links: Array<{
    label: LocalizedString;
    href: string;
  }>;
  featuredProduct: ShowcaseProduct;
  products: ShowcaseProduct[];
}

export interface ShowcaseFooterGroup {
  title: LocalizedString;
  links: Array<{
    label: LocalizedString;
    href: string;
  }>;
}

export interface SocialLink {
  platform: "facebook" | "instagram" | "youtube" | "twitter";
  href: string;
}

export interface DesktopMegaMenu {
  title: LocalizedString;
  groups: Array<{
    title: LocalizedString;
    links: LocalizedString[];
  }>;
  featured: {
    eyebrow: LocalizedString;
    title: LocalizedString;
    text: LocalizedString;
    image: string;
  };
}

const showcaseCategoryConfig = [
  {
    id: "heavy-guitars",
    label: { bg: "Heavy Китари", en: "Heavy Guitars" },
    eyebrow: { bg: "Вдъхновено от Thomann", en: "Inspired by Thomann" },
    description: {
      bg: "Реални Musicworld.bg продукти, подредени като department rack с бързи подкатегории и акцентен артикул.",
      en: "Real Musicworld.bg products arranged as a department rack with quick subcategories and a featured item.",
    },
    href: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
    links: [
      {
        label: { bg: "Jackson JS серия", en: "Jackson JS series" },
        href: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
      },
      {
        label: { bg: "Soloist модели", en: "Soloist models" },
        href: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
      },
      {
        label: { bg: "Beginner metal setups", en: "Beginner metal setups" },
        href: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
      },
      {
        label: { bg: "Промо електрически", en: "Promo electrics" },
        href: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
      },
    ],
    sourcePageId: "heavy-guitars",
    fallbackImage: categoryImageFallbacks.guitars,
  },
  {
    id: "digital-pianos",
    label: { bg: "Дигитални Пиана", en: "Digital Pianos" },
    eyebrow: { bg: "Работеща категория", en: "Working category" },
    description: {
      bg: "Компактни и домашни пиана с реални цени, изображения и линкове към Musicworld.bg.",
      en: "Compact and home-focused pianos with real prices, images and links to Musicworld.bg.",
    },
    href: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
    links: [
      {
        label: { bg: "Портативни модели", en: "Portable models" },
        href: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
      },
      {
        label: { bg: "Bluetooth серии", en: "Bluetooth series" },
        href: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
      },
      {
        label: { bg: "Домашни конзоли", en: "Home console pianos" },
        href: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
      },
      {
        label: { bg: "Bundle оферти", en: "Bundle offers" },
        href: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
      },
    ],
    sourcePageId: "digital-pianos",
    fallbackImage: categoryImageFallbacks.keys,
  },
  {
    id: "creator-studio",
    label: { bg: "Studio & Creator", en: "Studio & Creator" },
    eyebrow: { bg: "Musicworld.bg селекция", en: "Musicworld.bg selection" },
    description: {
      bg: "Трета работеща категория за mobile и desktop, изградена от реални Musicworld.bg listings.",
      en: "A third working category for mobile and desktop, built from real Musicworld.bg listings.",
    },
    href: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
    links: [
      {
        label: { bg: "Mobile creator gear", en: "Mobile creator gear" },
        href: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
      },
      {
        label: { bg: "Monitor control", en: "Monitor control" },
        href: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
      },
      {
        label: { bg: "Phantom power", en: "Phantom power" },
        href: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
      },
      {
        label: { bg: "Creator hardware", en: "Creator hardware" },
        href: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
      },
    ],
    sourcePageId: "audio-interfaces",
    fallbackImage: categoryImageFallbacks.studio,
  },
] as const;

export const mainCategories: MainCategory[] = topCategoryConfig.map((item) => ({
  id: item.id,
  image: item.image,
  itemCount:
    item.id === "deals"
      ? products.filter(
          (product) =>
            product.active && (product.oldPrice !== null || product.badges.includes("deal")),
        ).length
      : products.filter(
          (product) =>
            product.active &&
            product.categoryIds.some((categoryId) =>
              collectDescendantCategoryIds(item.baseCategoryId).includes(categoryId),
            ),
        ).length,
  label:
    item.id === "guitars"
      ? { bg: "Китари", en: "Guitars" }
      : item.id === "keys"
        ? { bg: "Клавишни", en: "Keys & Pianos" }
        : item.id === "drums"
          ? { bg: "Барабани", en: "Drums" }
          : item.id === "studio"
            ? { bg: "Студио", en: "Studio" }
            : item.id === "dj"
              ? { bg: "DJ техника", en: "DJ Gear" }
              : item.id === "live"
                ? { bg: "Озвучаване", en: "Live Sound" }
                : item.id === "accessories"
                  ? { bg: "Аксесоари", en: "Accessories" }
                  : { bg: "Оферти", en: "Deals" },
  href:
    item.id === "guitars"
      ? "#showcase-heavy-guitars"
      : item.id === "keys"
        ? "#showcase-digital-pianos"
        : item.id === "studio"
          ? "#showcase-creator-studio"
          : item.id === "deals"
            ? "#deals"
            : "#products",
}));

export const storefrontCopy = {
  bg: {
    localeSwitch: "English",
    shippingMessage: `Безплатна доставка над €${siteSettings.shipping.freeShippingThreshold}`,
    hotlineValue: siteSettings.contact.phone,
    supportLink: "Помощ",
    searchPlaceholder: "Търси продукти, марки и категории...",
    heroTitle: "Музикален магазин с по-добър mobile UX",
    heroText:
      "Добавих 3 работещи категории с реални продукти от Musicworld.bg и пренаредих началната страница за по-стегнат телефонен layout.",
    heroPrimary: "Виж категориите",
    heroSecondary: "Разгледай каталога",
    categoriesTitle: "Главни категории",
    categoriesText: "Бърз достъп до основните отдели и към 3-те работещи category racks.",
    showcaseTitle: "3 работещи категории с продукти",
    showcaseText:
      "Данните идват от Musicworld.bg listing feed, но presentation layer-ът е оригинален и подреден в Thomann-стил.",
    showcaseCta: "Отвори категорията",
    viewProduct: "Виж продукта",
    detailsCta: "Детайли",
    dealsTitle: "Подбрани оферти",
    dealsText:
      "Тази секция идва от локалния catalog layer и остава отделена от външния Musicworld feed.",
    dealsCta: "Всички оферти",
    featuredTitle: "Featured продукти",
    featuredCta: "Към витрината",
    brandsTitle: "Марки във витрината",
    benefitsTitle: "Какво подобрих",
    editorialTitle: "Бележки по структурата",
    newsletterText:
      "Имейл блокът остава content-managed и не зависи от ERP-like продуктовите данни.",
    newsletterPlaceholder: "Имейл адрес",
    stock: "Налично",
    outOfStock: "Провери наличност",
    productsLabel: "продукта",
    noResultsTitle: "Няма резултати",
    noResultsText:
      "Опитай с Yamaha, Jackson, Digital Pianos, Heavy Guitars или Studio.",
    mobileMenuTitle: "Навигация",
    mobileMenuText: "Работещ mobile drawer с бърз достъп до важните отдели.",
    mobileNav: {
      home: "Начало",
      search: "Търси",
      saved: "Любими",
      cart: "Количка",
      profile: "Профил",
    },
    newsletterTitle: "Имейл бюлетин",
    copyright: `© 2026 ${siteSettings.siteName}. Всички права запазени.`,
  },
  en: {
    localeSwitch: "Български",
    shippingMessage: `Free shipping over EUR ${siteSettings.shipping.freeShippingThreshold}`,
    hotlineValue: siteSettings.contact.phone,
    supportLink: "Support",
    searchPlaceholder: "Search products, brands and categories...",
    heroTitle: "Music retail UI with better mobile UX",
    heroText:
      "I added 3 working categories with real Musicworld.bg products and rearranged the homepage for a tighter phone layout.",
    heroPrimary: "View categories",
    heroSecondary: "Browse catalog",
    categoriesTitle: "Main categories",
    categoriesText: "Quick access to the main departments and the 3 working category racks.",
    showcaseTitle: "3 working categories with products",
    showcaseText:
      "The data comes from a Musicworld.bg listing feed, while the presentation layer stays original and Thomann-inspired.",
    showcaseCta: "Open category",
    viewProduct: "View product",
    detailsCta: "Details",
    dealsTitle: "Selected deals",
    dealsText:
      "This section comes from the local catalog layer and stays separate from the external Musicworld feed.",
    dealsCta: "All deals",
    featuredTitle: "Featured products",
    featuredCta: "To the showcase",
    brandsTitle: "Brands in the showcase",
    benefitsTitle: "What improved",
    editorialTitle: "Structure notes",
    newsletterText:
      "The newsletter block stays content-managed and does not depend on ERP-like product data.",
    newsletterPlaceholder: "Email address",
    stock: "In stock",
    outOfStock: "Check availability",
    productsLabel: "products",
    noResultsTitle: "No results found",
    noResultsText:
      "Try Yamaha, Jackson, Digital Pianos, Heavy Guitars or Studio.",
    mobileMenuTitle: "Navigation",
    mobileMenuText: "A working mobile drawer with quick access to the main departments.",
    mobileNav: {
      home: "Home",
      search: "Search",
      saved: "Saved",
      cart: "Cart",
      profile: "Profile",
    },
    newsletterTitle: "Newsletter",
    copyright: `© 2026 ${siteSettings.siteName}. All rights reserved.`,
  },
} as const;

export const storefrontBenefits = [
  {
    id: "shipping",
    icon: "truck" as const,
    title: {
      bg: `Безплатна доставка над €${siteSettings.shipping.freeShippingThreshold}`,
      en: `Free shipping over EUR ${siteSettings.shipping.freeShippingThreshold}`,
    },
    text: {
      bg: "По-компактен mobile layout и по-четими CTA бутони на тесни екрани.",
      en: "A tighter mobile layout and more readable CTA buttons on narrow screens.",
    },
  },
  {
    id: "structure",
    icon: "shield" as const,
    title: {
      bg: "Разделени data слоеве",
      en: "Separated data layers",
    },
    text: {
      bg: "Локалният catalog, homepage content-ът и временният Musicworld feed са държани отделно.",
      en: "The local catalog, homepage content and temporary Musicworld feed are kept separate.",
    },
  },
  {
    id: "showcases",
    icon: "support" as const,
    title: {
      bg: "Thomann-style category racks",
      en: "Thomann-style category racks",
    },
    text: {
      bg: "Трите секции комбинират подкатегории, акцентен продукт и реални product cards.",
      en: "The three sections combine subcategories, a featured product and real product cards.",
    },
  },
];

export const editorialCards = [
  {
    id: "mobile-layout",
    image: articleImageFallbacks.guitars,
    tag: { bg: "Mobile", en: "Mobile" },
    title: {
      bg: "Как е оптимизирана телефонната версия",
      en: "How the phone layout was optimized",
    },
    text: {
      bg: "Hero секцията е по-ниска, product grids са по-компактни, а mobile navigation вече работи реално.",
      en: "The hero is shorter, product grids are more compact and the mobile navigation now actually works.",
    },
  },
  {
    id: "category-racks",
    image: articleImageFallbacks.studio,
    tag: { bg: "Categories", en: "Categories" },
    title: {
      bg: "Защо тези категории изглеждат по-близо до Thomann",
      en: "Why these categories feel closer to Thomann",
    },
    text: {
      bg: "Използвани са sidebar links, акцентен продукт и стегнати листинги вместо обикновени tiles.",
      en: "Sidebar links, a featured product and tighter listings are used instead of plain tiles.",
    },
  },
  {
    id: "musicworld-feed",
    image: articleImageFallbacks.dj,
    tag: { bg: "Feed", en: "Feed" },
    title: {
      bg: "Какво е взето от Musicworld.bg",
      en: "What comes from Musicworld.bg",
    },
    text: {
      bg: "Трите работещи категории използват реални имена, цени, линкове и изображения от Musicworld product feed.",
      en: "The three working categories use real names, prices, links and images from the Musicworld product feed.",
    },
  },
];

export const storefrontFooterGroups: ShowcaseFooterGroup[] = navigation.footerColumns.map(
  (column) => ({
    title: {
      bg: cleanFooterLabel(column.title),
      en: column.title,
    },
    links: column.items.map((item) => ({
      label: {
        bg: cleanFooterLabel(item.label),
        en: item.label,
      },
      href: item.href,
    })),
  }),
);

export const socialLinks: SocialLink[] = [
  { platform: "facebook", href: "https://facebook.com/musicworld" },
  { platform: "instagram", href: "https://instagram.com/musicworld" },
  { platform: "youtube", href: "https://youtube.com/musicworld" },
  { platform: "twitter", href: "https://twitter.com/musicworld" },
];

export const desktopMegaMenus: Record<"guitars" | "keys" | "studio", DesktopMegaMenu> = {
  guitars: {
    title: { bg: "Китари", en: "Guitars" },
    groups: [
      {
        title: { bg: "Видове", en: "Types" },
        links: [
          { bg: "Electric guitars", en: "Electric guitars" },
          { bg: "Heavy guitars", en: "Heavy guitars" },
          { bg: "Acoustic guitars", en: "Acoustic guitars" },
          { bg: "Bass guitars", en: "Bass guitars" },
        ],
      },
      {
        title: { bg: "По стил", en: "By style" },
        links: [
          { bg: "Modern metal", en: "Modern metal" },
          { bg: "Classic rock", en: "Classic rock" },
          { bg: "Beginner rigs", en: "Beginner rigs" },
          { bg: "Stage-ready", en: "Stage-ready" },
        ],
      },
      {
        title: { bg: "Марки", en: "Brands" },
        links: [
          { bg: "Jackson", en: "Jackson" },
          { bg: "Fender", en: "Fender" },
          { bg: "Ibanez", en: "Ibanez" },
          { bg: "Gibson", en: "Gibson" },
        ],
      },
    ],
    featured: {
      eyebrow: { bg: "Musicworld.bg picks", en: "Musicworld.bg picks" },
      title: { bg: "Heavy Guitars", en: "Heavy Guitars" },
      text: {
        bg: "Реални Jackson листинги, подредени като компактен department panel.",
        en: "Real Jackson listings arranged as a compact department panel.",
      },
      image: categoryImageFallbacks.guitars,
    },
  },
  keys: {
    title: { bg: "Клавишни", en: "Keys" },
    groups: [
      {
        title: { bg: "Инструменти", en: "Instruments" },
        links: [
          { bg: "Digital pianos", en: "Digital pianos" },
          { bg: "Portable pianos", en: "Portable pianos" },
          { bg: "Home pianos", en: "Home pianos" },
          { bg: "Bundles", en: "Bundles" },
        ],
      },
      {
        title: { bg: "Сценарии", en: "Use cases" },
        links: [
          { bg: "Lessons", en: "Lessons" },
          { bg: "Home practice", en: "Home practice" },
          { bg: "Bluetooth models", en: "Bluetooth models" },
          { bg: "Compact living", en: "Compact living" },
        ],
      },
      {
        title: { bg: "Марки", en: "Brands" },
        links: [
          { bg: "Yamaha", en: "Yamaha" },
          { bg: "Casio", en: "Casio" },
          { bg: "Korg", en: "Korg" },
          { bg: "Roland", en: "Roland" },
        ],
      },
    ],
    featured: {
      eyebrow: { bg: "Работеща категория", en: "Working category" },
      title: { bg: "Digital Pianos", en: "Digital Pianos" },
      text: {
        bg: "Musicworld feed с реални цени и снимки, представен в по-Thomann композиция.",
        en: "A Musicworld feed with real prices and images presented in a more Thomann-like composition.",
      },
      image: categoryImageFallbacks.keys,
    },
  },
  studio: {
    title: { bg: "Студио", en: "Studio" },
    groups: [
      {
        title: { bg: "Основи", en: "Essentials" },
        links: [
          { bg: "Audio interfaces", en: "Audio interfaces" },
          { bg: "Creator hardware", en: "Creator hardware" },
          { bg: "Monitor control", en: "Monitor control" },
          { bg: "Phantom power", en: "Phantom power" },
        ],
      },
      {
        title: { bg: "За workflow", en: "For workflow" },
        links: [
          { bg: "Mobile creation", en: "Mobile creation" },
          { bg: "Desk setup", en: "Desk setup" },
          { bg: "Signal flow", en: "Signal flow" },
          { bg: "Hybrid rig", en: "Hybrid rig" },
        ],
      },
      {
        title: { bg: "Марки", en: "Brands" },
        links: [
          { bg: "Yamaha", en: "Yamaha" },
          { bg: "Behringer", en: "Behringer" },
          { bg: "Genelec", en: "Genelec" },
          { bg: "Focusrite", en: "Focusrite" },
        ],
      },
    ],
    featured: {
      eyebrow: { bg: "Трета категория", en: "Third category" },
      title: { bg: "Studio & Creator", en: "Studio & Creator" },
      text: {
        bg: "Показва реални артикули от Musicworld и затваря триадата от работещи категории за mobile и desktop.",
        en: "Shows real Musicworld items and completes the trio of working categories for mobile and desktop.",
      },
      image: categoryImageFallbacks.studio,
    },
  },
};

export const categoryShowcases: CategoryShowcase[] = showcaseCategoryConfig.map((config) =>
  buildCategoryShowcase(config),
);

function buildCategoryShowcase(
  config: (typeof showcaseCategoryConfig)[number],
): CategoryShowcase {
  const feedProducts = musicworldFeed.products
    .filter((product) => product.sourcePageId === config.sourcePageId)
    .sort((left, right) => {
      const availabilityBoost =
        Number(right.availability === "in_stock") - Number(left.availability === "in_stock");
      const discountBoost =
        ((right.oldPriceEur ?? right.currentPriceEur) - right.currentPriceEur) -
        ((left.oldPriceEur ?? left.currentPriceEur) - left.currentPriceEur);

      return availabilityBoost || discountBoost || right.currentPriceEur - left.currentPriceEur;
    });

  const featuredProduct =
    toShowcaseProduct(feedProducts[0], config.fallbackImage) ??
    buildFallbackShowcaseProduct(config);
  const products = feedProducts
    .slice(1, 5)
    .map((product) => toShowcaseProduct(product, config.fallbackImage))
    .filter((product): product is ShowcaseProduct => Boolean(product));

  return {
    id: config.id,
    label: config.label,
    eyebrow: config.eyebrow,
    description: config.description,
    href: config.href,
    sourceLabel: {
      bg: "Източник: Musicworld.bg",
      en: "Source: Musicworld.bg",
    },
    links: [...config.links],
    featuredProduct,
    products: products.length > 0 ? products : [featuredProduct],
  };
}

function toShowcaseProduct(
  product:
    | {
        name: string;
        description: string;
        brand: string;
        currentPriceEur: number;
        oldPriceEur: number | null;
        availability: string;
        productUrl: string;
        imageUrl: string | null;
      }
    | undefined,
  fallbackImage: string,
): ShowcaseProduct | null {
  if (!product) {
    return null;
  }

  const cleanName = cleanFeedText(product.name);
  const cleanDescription = clampFeedText(cleanFeedText(product.description), 18);

  return {
    id: product.productUrl,
    image: product.imageUrl ?? fallbackImage,
    brand: cleanFeedText(product.brand),
    name: {
      bg: cleanName,
      en: cleanName,
    },
    description: {
      bg: cleanDescription,
      en: cleanDescription,
    },
    price: product.currentPriceEur,
    originalPrice: product.oldPriceEur ?? undefined,
    inStock: product.availability === "in_stock",
    badge: buildFeedBadge(product.oldPriceEur, product.currentPriceEur),
    href: product.productUrl,
  };
}

function buildFallbackShowcaseProduct(
  config: (typeof showcaseCategoryConfig)[number],
): ShowcaseProduct {
  return {
    id: config.id,
    image: config.fallbackImage,
    brand: "Musicworld.bg",
    name: config.label,
    description: {
      bg: "Категорията е готова за нови реални продукти при следващо обновяване на feed-а.",
      en: "This category is ready for new real products on the next feed refresh.",
    },
    price: 0,
    inStock: true,
    href: config.href,
  };
}

function cleanFooterLabel(value: string) {
  const labels: Record<string, string> = {
    Shop: "Магазин",
    Support: "Поддръжка",
    Guides: "Наръчници",
    Guitars: "Китари",
    Drums: "Барабани",
    Keyboards: "Клавишни",
    "Studio & Recording": "Студио и запис",
    Shipping: "Доставка",
    Returns: "Връщане",
    Payments: "Плащане",
    Contact: "Контакт",
    "Buying Guides": "Ръководства за покупка",
    Reviews: "Ревюта",
    "Studio Setup Help": "Помощ за студио",
    "DJ Beginner Guides": "DJ наръчници",
  };

  return labels[value] ?? value;
}

function buildFeedBadge(oldPrice: number | null, currentPrice: number) {
  if (oldPrice && oldPrice > currentPrice) {
    const discount = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    return `-${discount}%`;
  }

  return undefined;
}

function cleanFeedText(value: string) {
  return value
    .replace(/&trade;/g, "")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&bull;/g, "•")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function clampFeedText(value: string, wordLimit: number) {
  const words = value.split(" ");

  if (words.length <= wordLimit) {
    return value;
  }

  return `${words.slice(0, wordLimit).join(" ")}...`;
}
