import type { ButtonHTMLAttributes, Ref } from "react";

type ButtonVariant = "primary" | "action" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

export function buttonClassName({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: ButtonClassOptions = {}): string {
  return [
    "ui-button",
    `ui-button--${variant}`,
    size !== "md" ? `ui-button--${size}` : "",
    block ? "ui-button--block" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonClassOptions {
  ref?: Ref<HTMLButtonElement>;
}

export function Button({ variant, size, block, className, children, type = "button", ref, ...rest }: ButtonProps) {
  return (
    <button ref={ref} className={buttonClassName({ variant, size, block, className })} type={type} {...rest}>
      {children}
    </button>
  );
}
