import { notFound } from "next/navigation";
import { requireViewer } from "@/server/session";

// Checked here rather than in the page so a 404 is sent before the loading state starts streaming.
export default async function SpecialistsOnlyLayout({ children }: LayoutProps<"/me">) {
  const viewer = await requireViewer();
  if (viewer.writesFor.length === 0) notFound();
  return children;
}
