"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import logoMain from "../../logo_main.png";
import { CartButton } from "@/components/cart-provider";
import { Heart, Mail, Menu, Search, User, X } from "lucide-react";
import { content, footerGroups, type Locale } from "@/lib/storefront-data";

type DrawerTabId = "products" | "service" | "about";

const utilityLeftLinks = [
  { href: "/categories", label: { bg: "Сервиз", en: "Service" } },
  { href: "/categories", label: { bg: "Контакти", en: "Contact us" } },
  { href: "/categories", label: { bg: "За нас", en: "About Us" } },
] as const;

const utilityRightLinks = [
  {
    href: "/categories",
    label: { bg: "3-годишна гаранция MusicWorld", en: "3-Year MusicWorld Warranty" },
  },
  { href: "/categories", label: { bg: "Сигурно плащане", en: "Payment Security" } },
] as const;

const dealLinks = [
  { href: "/categories", label: { bg: "Горещи оферти", en: "Hot Deals" } },
  { href: "/categories", label: { bg: "Нови", en: "New" } },
  { href: "/categories", label: { bg: "Топ продажби", en: "Top-Seller" } },
  { href: "/categories", label: { bg: "Изгодни", en: "Bargains" } },
] as const;

const categoryBarItems = [
  { href: "/categories/guitars", label: { bg: "Кит./Бас", en: "Guit/Bass" } },
  { href: "/categories/drums", label: { bg: "Барабани", en: "Drums" } },
  { href: "/categories/keyboards", label: { bg: "Клавишни", en: "Keys" } },
  { href: "/categories/studio-recording", label: { bg: "Студио", en: "Studio" } },
  { href: "/categories", label: { bg: "Софтуер", en: "Software" } },
  { href: "/categories/pa-live-sound", label: { bg: "PA", en: "PA" } },
  { href: "/categories", label: { bg: "Осветление", en: "Lighting" } },
  { href: "/categories/dj-equipment", label: { bg: "DJ", en: "DJ" } },
  { href: "/categories", label: { bg: "Видео", en: "Video" } },
  { href: "/categories", label: { bg: "Микрофони", en: "Microphones" } },
  { href: "/categories", label: { bg: "Сигнал проц.", en: "Signal Proc." } },
  { href: "/categories", label: { bg: "Духови", en: "Brass" } },
  { href: "/categories", label: { bg: "Традиционни", en: "Traditional" } },
  { href: "/categories", label: { bg: "Ноти", en: "Sheet" } },
  { href: "/categories/accessories", label: { bg: "Кейсове", en: "Cases" } },
  { href: "/categories/accessories", label: { bg: "Кабели", en: "Cables" } },
  { href: "/categories/accessories", label: { bg: "Аксесоари", en: "Accessories" } },
] as const;

const drawerTabs = [
  { id: "products", label: { bg: "Продукти", en: "Products" } },
  { id: "service", label: { bg: "Сервиз", en: "Service" } },
  { id: "about", label: { bg: "За нас", en: "About Us" } },
] as const;

const drawerProductLinks = [
  { id: "guitars", href: "/categories/guitars", label: { bg: "Китари и баси", en: "Guitars and Basses" } },
  { id: "drums", href: "/categories/drums", label: { bg: "Барабани и перкусии", en: "Drums and Percussion" } },
  { id: "keys", href: "/categories/keyboards", label: { bg: "Клавишни", en: "Keys" } },
  {
    id: "studio",
    href: "/categories/studio-recording",
    label: { bg: "Студио и звукозапис", en: "Studio and Recording Equipment" },
  },
  { id: "software", href: "/categories", label: { bg: "Софтуер", en: "Software" } },
  { id: "pa", href: "/categories/pa-live-sound", label: { bg: "PA оборудване", en: "PA Equipment" } },
  { id: "lighting", href: "/categories", label: { bg: "Осветление и сцена", en: "Lighting and Stage" } },
  { id: "dj", href: "/categories/dj-equipment", label: { bg: "DJ оборудване", en: "DJ Equipment" } },
  { id: "video", href: "/categories", label: { bg: "Broadcast и видео", en: "Broadcast & Video" } },
  { id: "mics", href: "/categories", label: { bg: "Микрофони", en: "Microphones" } },
  {
    id: "signal",
    href: "/categories",
    label: { bg: "Ефекти и сигнални процесори", en: "Effect and Signal Processors" },
  },
  { id: "wind", href: "/categories", label: { bg: "Духови инструменти", en: "Wind Instruments" } },
  { id: "traditional", href: "/categories", label: { bg: "Традиционни инструменти", en: "Traditional Instruments" } },
  { id: "sheet", href: "/categories", label: { bg: "Ноти", en: "Sheet Music" } },
  { id: "cases", href: "/categories/accessories", label: { bg: "Кейсове, стелажи и чанти", en: "Cases, Racks and Bags" } },
  { id: "cables", href: "/categories/accessories", label: { bg: "Кабели и конектори", en: "Cables and Connectors" } },
  { id: "accessories", href: "/categories/accessories", label: { bg: "Аксесоари", en: "Accessories" } },
] as const;

const drawerServiceLinks = [
  { id: "repair", href: "/categories", label: { bg: "Сервиз и ремонти", en: "Repair Service" } },
  { id: "warranty", href: "/categories", label: { bg: "Гаранция и рекламации", en: "Warranty and Claims" } },
  { id: "returns", href: "/categories", label: { bg: "Връщане и замяна", en: "Returns and Exchange" } },
  { id: "shipping", href: "/categories", label: { bg: "Доставка", en: "Shipping" } },
  { id: "payment", href: "/categories", label: { bg: "Плащания", en: "Payments" } },
  { id: "support", href: "/categories", label: { bg: "Поддръжка", en: "Support" } },
] as const;

const drawerAboutLinks = [
  { id: "company", href: "/categories", label: { bg: "За MusicWorld", en: "About MusicWorld" } },
  { id: "team", href: "/categories", label: { bg: "Екип и контакти", en: "Team and Contacts" } },
  { id: "stores", href: "/categories", label: { bg: "Магазини", en: "Stores" } },
  { id: "careers", href: "/categories", label: { bg: "Кариери", en: "Careers" } },
  { id: "partners", href: "/categories", label: { bg: "Партньори", en: "Partners" } },
  { id: "blog", href: "/categories", label: { bg: "Блог и новини", en: "Blog and News" } },
] as const;

interface HomeHeaderProps {
  locale: Locale;
  onLocaleToggle: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function HomeHeader({
  locale,
  onLocaleToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: HomeHeaderProps) {
  const copy = content[locale];
  const localeSwitchLabel = locale === "bg" ? "Switch to English" : "Смени на български";
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTabId>("products");

  useEffect(() => {
    if (!isSideMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSideMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSideMenuOpen]);

  const drawerEntries =
    activeDrawerTab === "products"
      ? drawerProductLinks
      : activeDrawerTab === "service"
        ? drawerServiceLinks
        : drawerAboutLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#e7e7e7] text-[#1f1f1f]">
      <div className="hidden border-b border-black/10 md:block">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-3 py-2">
          <nav className="flex items-center gap-6 text-[15px]">
            {utilityLeftLinks.map((item) => (
              <Link key={item.label.en} href={item.href} className="transition hover:text-black">
                {item.label[locale]}
              </Link>
            ))}
          </nav>

          <Link href="/" className="justify-self-center">
            <Image src={logoMain} alt="MusicWorld" priority className="h-11 w-auto" />
          </Link>

          <nav className="flex items-center justify-end gap-8 text-[15px]">
            {utilityRightLinks.map((item) => (
              <Link key={item.label.en} href={item.href} className="transition hover:text-black">
                {item.label[locale]}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="hidden border-b border-black/10 md:block">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_minmax(320px,480px)_1fr] items-center gap-4 px-3 py-3">
          <nav className="flex items-center gap-1.5 text-sm">
            <button
              type="button"
              aria-label={locale === "bg" ? "Отвори странично меню" : "Open side menu"}
              onClick={() => {
                setActiveDrawerTab("products");
                setIsSideMenuOpen(true);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#1f1f1f] transition hover:bg-black/5"
            >
              <Menu className="h-7 w-7 stroke-[2.2]" />
            </button>

            {dealLinks.map((item, index) => (
              <Link
                key={item.label.en}
                href={item.href}
                className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-3.5 text-center text-[14px] font-semibold tracking-[0.01em] transition-all ${
                  index === 0
                    ? "text-[#c31212] hover:text-[#a50f0f]"
                    : "text-[#1f1f1f] hover:text-black"
                }`}
              >
                {item.label[locale]}
              </Link>
            ))}
          </nav>

          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder ?? copy.searchPlaceholder}
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onLocaleToggle}
              aria-label={localeSwitchLabel}
              className="inline-flex items-center gap-1 rounded-full border border-[#bdbdbd] bg-white px-3 py-1.5 text-xs font-semibold text-[#2b2b2b] transition hover:border-[#8f8f8f] hover:text-black"
            >
              <span className={locale === "bg" ? "text-black" : "text-[#7a7a7a]"}>BG</span>
              <span className="text-[#9a9a9a]">/</span>
              <span className={locale === "en" ? "text-black" : "text-[#7a7a7a]"}>EN</span>
            </button>
            <HeaderIcon icon={<User className="h-5 w-5" />} />
            <HeaderIcon icon={<Heart className="h-5 w-5" />} />
            <CartButton className="rounded-full border border-[#8c8c8c] bg-white hover:bg-[#f5f5f5]" />
          </div>
        </div>
      </div>

      <div className="hidden bg-[#1d1e20] md:block">
        <nav
          className={`mx-auto flex w-full max-w-[1440px] px-2 py-2 text-white ${
            locale === "bg"
              ? "flex-wrap items-center justify-center gap-1.5"
              : "items-center gap-2 overflow-x-auto"
          }`}
        >
          {categoryBarItems.map((item, index) => (
            <Link
              key={item.label.en}
              href={item.href}
              className={`whitespace-nowrap rounded-md transition ${
                locale === "bg" ? "px-2.5 py-1 text-[13px]" : "px-3 py-1.5 text-sm"
              } ${
                index === 0
                  ? "bg-[#3a3c3f] text-white"
                  : "text-white/90 hover:bg-[#2d2f33] hover:text-white"
              }`}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-b border-black/10 px-3 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <Image src={logoMain} alt="MusicWorld" priority className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLocaleToggle}
              aria-label={localeSwitchLabel}
              className="inline-flex items-center gap-1 rounded-full border border-[#b9b9b9] bg-white px-3 py-1 text-xs font-semibold"
            >
              <span className={locale === "bg" ? "text-black" : "text-[#7a7a7a]"}>BG</span>
              <span className="text-[#9a9a9a]">/</span>
              <span className={locale === "en" ? "text-black" : "text-[#7a7a7a]"}>EN</span>
            </button>
            <HeaderIcon icon={<User className="h-5 w-5" />} />
            <HeaderIcon icon={<Heart className="h-5 w-5" />} />
            <CartButton className="rounded-full border border-[#8c8c8c] bg-white hover:bg-[#f5f5f5]" />
          </div>
        </div>
        <div className="mt-3">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder ?? copy.searchPlaceholder}
          />
        </div>
        <nav className="mt-3 flex items-center gap-1.5 overflow-x-auto">
          {dealLinks.map((item, index) => (
            <Link
              key={item.label.en}
              href={item.href}
              className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-center text-[12px] font-semibold tracking-[0.01em] transition ${
                index === 0
                  ? "text-[#c31212] hover:text-[#a50f0f]"
                  : "text-[#1f1f1f] hover:text-black"
              }`}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </div>

      <div className="bg-[#1d1e20] md:hidden">
        <nav
          className={`flex px-2 py-2 text-white ${
            locale === "bg"
              ? "flex-wrap items-center justify-center gap-1.5"
              : "items-center gap-2 overflow-x-auto"
          }`}
        >
          {categoryBarItems.map((item, index) => (
            <Link
              key={item.label.en}
              href={item.href}
              className={`whitespace-nowrap rounded-md transition ${
                locale === "bg" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
              } ${
                index === 0
                  ? "bg-[#3a3c3f] text-white"
                  : "text-white/90 hover:bg-[#2d2f33] hover:text-white"
              }`}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-[90] hidden transition md:block ${
          isSideMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label={locale === "bg" ? "Затвори меню" : "Close menu"}
          onClick={() => setIsSideMenuOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isSideMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[min(520px,92vw)] border-r border-[#2f2f2f] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out ${
            isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end px-7 pt-6">
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#202020] transition hover:bg-[#f3f3f3]"
              aria-label={locale === "bg" ? "Затвори меню" : "Close menu"}
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-center gap-6">
              {drawerTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDrawerTab(tab.id)}
                  className={`border-b pb-1 text-[2rem] leading-none transition ${
                    activeDrawerTab === tab.id
                      ? "border-[#7a3cff] text-[#7a3cff]"
                      : "border-[#1f1f1f] text-[#1f1f1f] hover:text-black"
                  }`}
                >
                  {tab.label[locale]}
                </button>
              ))}
            </div>

            <nav className="mt-8 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {drawerEntries.map((item) => {
                  const isHighlighted = activeDrawerTab === "products" && item.id === "drums";

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setIsSideMenuOpen(false)}
                        className={`block text-[2.15rem] font-semibold leading-tight transition ${
                          isHighlighted ? "text-[#6f25ff]" : "text-[#2a2a2a] hover:text-black"
                        }`}
                      >
                        {item.label[locale]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </header>
  );
}

interface HomeFooterProps {
  locale: Locale;
}

export function HomeFooter({ locale }: HomeFooterProps) {
  const copy = content[locale];

  return (
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
            <h4 className="mb-4 font-semibold">Newsletter</h4>
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
        className="w-full rounded-full border border-[#d6d6d6] bg-[#f5f5f5] px-5 py-3 pl-12 text-lg text-[#343434] outline-none transition focus:border-[#b8b8b8] focus:bg-white"
      />
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6a6a6a]" />
    </div>
  );
}

function HeaderIcon({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#8c8c8c] bg-white text-[#222] transition hover:bg-[#f5f5f5]"
    >
      {icon}
    </button>
  );
}
