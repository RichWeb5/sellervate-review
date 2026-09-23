import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { requireViewer } from "@/server/session";

export default async function HomePage() {
  const viewer = await requireViewer();
  if (viewer.leads.length > 0) redirect("/queue");
  if (viewer.writesFor.length > 0) redirect("/me");

  return (
    <EmptyState title="You are not on any brand yet">
      Once someone adds you to a brand, its replies or your feedback will show up here.
    </EmptyState>
  );
}
