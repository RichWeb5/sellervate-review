import { notFound } from "next/navigation";
import { requireViewer } from "@/server/session";

// Checked here rather than in the page so a 404 is sent before the loading state starts streaming.
export default async function BrandLeadsOnlyLayout({
  children,
  params,
}: LayoutProps<"/brands/[slug]">) {
  const [{ slug }, viewer] = await Promise.all([params, requireViewer()]);
  if (!viewer.leads.some((brand) => brand.slug === slug)) notFound();
  return children;
}
