type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-brand-red bg-brand-red text-white hover:border-brand-red-hover hover:bg-brand-red-hover active:border-brand-red-active active:bg-brand-red-active",
  secondary: "border-brand-red bg-transparent text-brand-red hover:bg-brand-cream active:bg-brand-cream/70",
  ghost: "border-transparent bg-transparent text-ink hover:bg-brand-cream active:bg-brand-cream/70",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2",
  md: "min-h-12 px-6 py-3",
  lg: "min-h-13 px-8 py-3",
};

// Share presentation with Link/anchor while preserving native navigation semantics.
export function buttonStyles({ variant = "primary", size = "md", fullWidth = false, className = "" }: ButtonStyleOptions = {}) {
  return [
    "inline-flex min-w-11 items-center justify-center gap-2 rounded-lg border text-center font-brand text-base font-medium leading-[1.4] transition-colors duration-150 disabled:pointer-events-none disabled:border-line disabled:bg-line disabled:text-muted disabled:cursor-not-allowed",
    variants[variant], sizes[size], fullWidth ? "w-full" : "", className,
  ].filter(Boolean).join(" ");
}


