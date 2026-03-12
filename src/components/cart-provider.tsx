"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import siteSettingsData from "@/data/site-settings.json";
import { buttonStyles } from "@/lib/button-styles";
import { formatEuro, getFreeShippingProgress } from "@/lib/commerce-ui";

const STORAGE_KEY = "musicworld-cart-v1";
const freeShippingThreshold = siteSettingsData.shipping.freeShippingThreshold;
const dispatchMessage = siteSettingsData.shipping.dispatchMessage;

export interface CartProductInput {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  maxQuantity?: number;
  externalUrl?: string;
}

export interface CartItem extends CartProductInput {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CartProductInput, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number, maxQuantity = 99) {
  if (maxQuantity <= 0) {
    return 0;
  }

  return Math.min(Math.max(1, quantity), maxQuantity);
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function clearCart() {
    setItems([]);
  }

  function removeItem(productId: string) {
    setItems((current) => current.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        if (quantity <= 0) {
          return [];
        }

        const nextQuantity = clampQuantity(quantity, item.maxQuantity);

        if (nextQuantity <= 0) {
          return [];
        }

        return [
          {
            ...item,
            quantity: nextQuantity,
          },
        ];
      }),
    );
  }

  function addItem(product: CartProductInput, quantity = 1) {
    const maxQuantity = product.maxQuantity ?? 99;

    if (maxQuantity <= 0) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: clampQuantity(item.quantity + quantity, maxQuantity),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: clampQuantity(quantity, maxQuantity),
        },
      ];
    });

    setIsOpen(true);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

export function CartButton({ className = "" }: { className?: string }) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--gray-700)] transition hover:bg-[var(--gray-100)] ${className}`.trim()}
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 ? (
        <span className="absolute right-1.5 top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}

function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const shippingProgress = getFreeShippingProgress(subtotal, freeShippingThreshold);
  const bagLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/45 transition ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-white shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Cart
            </div>
            <h2 className="text-xl font-black tracking-tight">Your gear bag</h2>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              {itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount === 1 ? "" : "s"} ready`}
            </p>
            <p className="mt-1 text-xs text-[var(--gray-400)]">Saved on this device while you browse</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--gray-100)]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--primary)]">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Cart is empty</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--gray-600)]">
              Add products to compare setups, keep the subtotal in view and come back to the bag while you browse.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-[var(--gray-500)]">
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                EUR pricing incl. VAT
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                {dispatchMessage}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                Support by phone and email
              </span>
            </div>
            <div className="mt-6 grid w-full max-w-sm gap-3">
              <Link
                href="/categories"
                onClick={closeCart}
                className={buttonStyles.primary}
              >
                <span>Browse categories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className={buttonStyles.secondary}
              >
                Continue shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-semibold text-[var(--gray-900)]">{bagLabel} in bag</div>
                  <div className="mt-0.5 text-[var(--gray-500)]">Subtotal updates instantly while you edit quantities</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gray-400)]">
                    Subtotal
                  </div>
                  <div className="mt-1 text-lg font-black text-[var(--gray-900)]">{formatEuro(subtotal)}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--gray-50)] p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                            {item.brand}
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{item.name}</div>
                          <div className="mt-2 text-xs text-[var(--gray-500)]">
                            Unit price <span className="font-semibold text-[var(--gray-700)]">{formatEuro(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gray-400)]">
                            Line total
                          </div>
                          <div className="mt-1 text-base font-black text-[var(--gray-900)]">
                            {formatEuro(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--gray-500)]">
                        <span className="rounded-full bg-white px-3 py-1.5 font-medium text-[var(--gray-600)]">
                          {dispatchMessage}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 font-medium text-[var(--gray-600)]">
                          Prices incl. VAT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gray-400)]">
                        Quantity
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-2 py-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--gray-100)] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Decrease quantity for ${item.name}`}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--gray-100)] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Increase quantity for ${item.name}`}
                          disabled={item.quantity >= (item.maxQuantity ?? 99)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-[var(--gray-500)]">
                        {(item.maxQuantity ?? 99) < 99
                          ? `Available for up to ${item.maxQuantity} pcs in this order`
                          : "Adjust quantity directly in the bag"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {item.externalUrl ? (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
                        >
                          Product details
                        </a>
                      ) : (
                        <Link
                          href="/"
                          onClick={closeCart}
                          className="inline-flex text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
                        >
                          Continue browsing
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-[var(--gray-600)] transition hover:border-[var(--border)] hover:bg-white hover:text-[var(--gray-900)]"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-5">
              <div className="rounded-3xl bg-[var(--gray-50)] p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--gray-700)]">
                  <span>
                    {shippingProgress.unlocked
                      ? "Free shipping unlocked"
                      : `${formatEuro(shippingProgress.remaining)} away from free shipping`}
                  </span>
                  <span>{shippingProgress.progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--gray-200)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                    style={{ width: `${shippingProgress.progress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--gray-500)]">
                  {dispatchMessage} VAT included where applicable.
                </p>
                <div className="mt-4 grid gap-2 text-sm text-[var(--gray-600)]">
                  <div className="flex items-center justify-between">
                    <span>{bagLabel}</span>
                    <span className="font-semibold text-[var(--gray-900)]">{formatEuro(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{shippingProgress.unlocked ? "Free" : "Calculated at checkout"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-[var(--gray-600)]">
                <span>Subtotal</span>
                <span className="text-lg font-black text-[var(--gray-900)]">
                  {formatEuro(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--gray-500)]">
                Shipping is calculated by size and weight before payment. Taxes are included where applicable.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--gray-500)]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>Secure checkout flow ready</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  <Truck className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>Dispatch by stock status</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-2">
                  <Headphones className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>{siteSettingsData.contact.phone}</span>
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  className={buttonStyles.primary}
                >
                  <span>Proceed to checkout soon</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeCart}
                  className={buttonStyles.secondary}
                >
                  Continue shopping
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--gray-500)]">
                  Frontend cart only. Checkout and payment are not connected yet.
                </p>
                <button
                  type="button"
                  onClick={clearCart}
                  className={buttonStyles.ghost}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear bag</span>
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
