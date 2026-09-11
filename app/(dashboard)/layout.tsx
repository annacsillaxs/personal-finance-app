import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Shell } from "@/components/sidebar/Shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Read on the server so the rail renders at the right width immediately.
  const store = await cookies();
  const minimised = store.get("sidebar")?.value === "minimised";

  return <Shell initiallyMinimised={minimised}>{children}</Shell>;
}
