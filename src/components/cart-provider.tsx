"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "musicworld-cart-v1";

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
  return Math.min(Math.max(1, quantity), maxQuantity);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
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

        return [
          {
            ...item,
            quantity: clampQuantity(quantity, item.maxQuantity),
          },
        ];
      }),
    );
  }

  function addItem(product: CartProductInput, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const maxQuantity = product.maxQuantity ?? 99;

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
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem, clearCart } =
    useCart();

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
              Add powered mixers or other products and they will stay here while you
              browse.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-5 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--gray-50)] p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                        {item.brand}
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-5">{item.name}</div>
                      <div className="mt-2 text-sm font-bold">{formatCurrency(item.price)}</div>

                      {item.externalUrl ? (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
                        >
                          Source details
                        </a>
                      ) : (
                        <Link
                          href="/"
                          className="mt-2 inline-flex text-xs font-semibold text-[var(--gray-500)] underline underline-offset-2"
                        >
                          Continue browsing
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--gray-500)] transition hover:bg-white"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--gray-100)]"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--gray-100)]"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-5">
              <div className="flex items-center justify-between text-sm text-[var(--gray-600)]">
                <span>Subtotal</span>
                <span className="text-lg font-black text-[var(--gray-900)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--gray-500)]">
                Demo cart only. No payment or backend checkout is connected yet.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-full border border-[var(--border-strong)] px-4 py-3 text-sm font-semibold"
                >
                  Clear cart
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Checkout soon
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
