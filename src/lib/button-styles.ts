export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(12,140,233,0.62)] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--gray-700)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
  muted:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--gray-50)] px-4 py-2.5 text-sm font-semibold text-[var(--gray-700)] transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
  pill:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--gray-700)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--gray-600)] transition hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
  icon:
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white text-[var(--gray-700)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
} as const;
