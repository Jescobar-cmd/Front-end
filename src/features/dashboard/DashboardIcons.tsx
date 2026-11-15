import type { ReactNode } from "react";

export type DashboardIconKind =
  | "contract"
  | "delivery"
  | "payment"
  | "wallet"
  | "bell"
  | "message"
  | "proposal"
  | "service"
  | "star"
  | "eye"
  | "chart"
  | "search"
  | "plus"
  | "user"
  | "dispute";

const ICONS: Record<DashboardIconKind, ReactNode> = {
  contract: (
    <>
      <path d="M7 3.5h7l4 4v13H7z" />
      <path d="M14 3.5v4h4" />
      <path d="M10 12h5M10 15.5h5" />
    </>
  ),
  delivery: (
    <>
      <path d="m12 3.5 8 4.2v8.6l-8 4.2-8-4.2V7.7l8-4.2Z" />
      <path d="m4 7.7 8 4.2 8-4.2M12 11.9v8.6" />
      <path d="m8.5 5.6 8 4.2" />
    </>
  ),
  payment: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M7 15h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M4 9h16" />
      <path d="M15 13h4v3h-4a1.5 1.5 0 0 1 0-3Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  message: (
    <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
  ),
  proposal: (
    <>
      <path d="m21 3.5-7.2 17-3.3-7-7-3.3L21 3.5Z" />
      <path d="M10.5 13.5 21 3.5" />
    </>
  ),
  service: (
    <>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3.5 12h17" />
    </>
  ),
  star: <path d="m12 3.6 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.6Z" />,
  eye: (
    <>
      <path d="M3.5 12s3.1-6 8.5-6 8.5 6 8.5 6-3.1 6-8.5 6-8.5-6-8.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  dispute: (
    <>
      <path d="M12 3.5 5 6.2v5.4c0 4 2.9 7.2 7 8.4 4.1-1.2 7-4.4 7-8.4V6.2L12 3.5Z" />
      <path d="M12 8v4.5M12 15.5h.01" />
    </>
  ),
};

export function DashboardIcon({ kind }: { kind: DashboardIconKind }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[kind]}
    </svg>
  );
}
