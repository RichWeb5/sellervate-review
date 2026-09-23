import { BrandMark } from "@/components/ui/brand-mark";
import type { Viewer } from "@/server/session";
import { UserSwitcher } from "./user-switcher";

export function AppShell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-base-300 p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:border-r">
        <p className="px-2 text-base font-semibold tracking-tight">Sellervate Review</p>

        <nav className="flex flex-1 flex-col gap-6 text-sm">
          <BrandList title="You lead" brands={viewer.leads} />
          <BrandList title="You write for" brands={viewer.writesFor} />
        </nav>

        <UserSwitcher viewer={viewer} />
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

function BrandList({ title, brands }: { title: string; brands: Viewer["leads"] }) {
  if (brands.length === 0) return null;

  return (
    <section className="flex flex-col gap-1">
      <h2 className="px-2 text-xs font-medium text-muted">{title}</h2>
      <ul>
        {brands.map((brand) => (
          <li key={brand.id} className="px-2 py-1.5">
            <BrandMark brand={brand} />
          </li>
        ))}
      </ul>
    </section>
  );
}
