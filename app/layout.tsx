import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted from the fonts shipped with the challenge, so there is no
// external request and no layout shift on first paint.
const publicSans = localFont({
  src: [
    {
      path: "./fonts/PublicSans-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "./fonts/PublicSans-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "finance",
  description: "Personal finance app",
  icons: { icon: "/images/favicon-32x32.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body>{children}</body>
    </html>
  );
}
