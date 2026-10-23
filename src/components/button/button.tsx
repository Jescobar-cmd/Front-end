import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const clases = ["btn", `btn--${variant}`, "btn-primary", className].filter(Boolean).join(" ");
  return (
    <button className={clases} {...rest}>
      {children}
    </button>
  );
}
