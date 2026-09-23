import { signInAs, signOut } from "@/server/actions/session";
import { demoAccounts } from "@/server/demo-accounts";
import type { Viewer } from "@/server/session";

export function UserSwitcher({ viewer }: { viewer: Viewer }) {
  return (
    <details className="dropdown dropdown-top w-full">
      <summary className="btn h-auto w-full justify-start gap-3 btn-ghost px-2 py-2 font-normal">
        <Initials name={viewer.fullName} />
        <span className="flex min-w-0 flex-col items-start">
          <span className="truncate text-sm font-semibold">{viewer.fullName}</span>
          <span className="truncate text-xs text-muted">Switch person</span>
        </span>
      </summary>
      <div className="dropdown-content z-10 mb-2 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
        <p className="px-2 pt-1 pb-2 text-xs text-muted">
          Sign-in is stubbed. Access is still enforced by the database.
        </p>
        <ul className="flex flex-col gap-0.5">
          {demoAccounts.map((account) => (
            <li key={account.email}>
              <form action={signInAs}>
                <input type="hidden" name="email" value={account.email} />
                <button
                  type="submit"
                  disabled={account.email === viewer.email}
                  className="btn w-full justify-between btn-ghost font-normal btn-sm"
                >
                  <span>{account.name}</span>
                  <span className="text-xs text-muted">{account.role}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={signOut} className="mt-1 border-t border-base-300 pt-1">
          <button type="submit" className="btn w-full justify-start btn-ghost font-normal btn-sm">
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-content">
      {initials}
    </span>
  );
}
