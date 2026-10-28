import type { ButtonHTMLAttributes } from "react";
import { buttonStyles, type ButtonStyleOptions } from "./button-styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions & { loading?: boolean };

export default function Button({ children, variant, size, fullWidth, className, loading = false, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button {...props} type={type} className={buttonStyles({ variant, size, fullWidth, className })} disabled={disabled || loading} aria-busy={loading || undefined}>
      {children}
    </button>
  );
}
