import { BrandMark } from "@/components/ui/brand-mark";
import { yesterday } from "@/lib/dates";
import { queueHref } from "@/features/review/routes";
import type { Viewer } from "@/server/session";
import { NavLink } from "./nav-link";
import { UserSwitcher } from "./user-switcher";

export function AppShell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  const day = yesterday();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-base-300 p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:border-r">
        <p className="px-2 text-base font-semibold tracking-tight">Sellervate Review</p>

        <nav className="flex flex-1 flex-col gap-6 text-sm">
          {viewer.leads.length > 0 && (
            <section className="flex flex-col gap-0.5">
              <h2 className="px-2 pb-1 text-xs font-medium text-muted">Review</h2>
              <NavLink href={queueHref({ day })} match={{ path: "/queue", brand: null }}>
                All brands
              </NavLink>
              {viewer.leads.map((brand) => (
                <NavLink
                  key={brand.id}
                  href={queueHref({ day, brand: brand.slug })}
                  match={{ path: "/queue", brand: brand.slug }}
                >
                  <BrandMark brand={brand} />
                </NavLink>
              ))}
            </section>
          )}

          {viewer.writesFor.length > 0 && (
            <section className="flex flex-col gap-0.5">
              <h2 className="px-2 pb-1 text-xs font-medium text-muted">You write for</h2>
              <NavLink href="/me" match={{ path: "/me", brand: null }}>
                Your feedback
              </NavLink>
              {viewer.writesFor.map((brand) => (
                <p key={brand.id} className="px-2 py-1.5">
                  <BrandMark brand={brand} />
                </p>
              ))}
            </section>
          )}
        </nav>

        <UserSwitcher viewer={viewer} />
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
