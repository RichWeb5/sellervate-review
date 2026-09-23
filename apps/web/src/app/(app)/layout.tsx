import { AppShell } from "@/components/app-shell/app-shell";
import { requireViewer } from "@/server/session";

export default async function SignedInLayout({ children }: LayoutProps<"/">) {
  const viewer = await requireViewer();
  return <AppShell viewer={viewer}>{children}</AppShell>;
}
