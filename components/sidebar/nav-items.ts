export type NavItem = {
  href: string;
  label: string;
  /** Path to the SVG used as a CSS mask, so it can inherit colour. */
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: "/images/icon-nav-overview.svg" },
  {
    href: "/transactions",
    label: "Transactions",
    icon: "/images/icon-nav-transactions.svg",
  },
  { href: "/budgets", label: "Budgets", icon: "/images/icon-nav-budgets.svg" },
  { href: "/pots", label: "Pots", icon: "/images/icon-nav-pots.svg" },
  {
    href: "/recurring-bills",
    label: "Recurring bills",
    icon: "/images/icon-nav-recurring-bills.svg",
  },
];
