import { redirect } from "next/navigation";
import { requireViewer } from "@/server/session";

export default async function HomePage() {
  const viewer = await requireViewer();
  if (viewer.leads.length > 0) redirect("/queue");

  const firstName = viewer.fullName.split(" ")[0];

  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h1 className="text-2xl">Hi {firstName}</h1>
      <p className="text-muted">You can read what your lead thought of the replies you sent.</p>
    </div>
  );
}
