import { redirect } from "next/navigation";
import { signInAs } from "@/server/actions/session";
import { demoAccounts, type DemoAccount } from "@/server/demo-accounts";
import { getViewer } from "@/server/session";

export default async function SignInPage() {
  if (await getViewer()) redirect("/");

  const leads = demoAccounts.filter((account) => account.role === "Team lead");
  const specialists = demoAccounts.filter((account) => account.role === "Specialist");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Choose who you are</h1>
        <p className="text-muted">
          Sign-in is stubbed for this demo. What each person can see is still enforced by the
          database, so switching people changes what the API returns, not just what the page shows.
        </p>
      </header>

      <AccountGroup title="Team leads" accounts={leads} />
      <AccountGroup title="Specialists" accounts={specialists} />
    </main>
  );
}

function AccountGroup({ title, accounts }: { title: string; accounts: readonly DemoAccount[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {accounts.map((account) => (
          <li key={account.email}>
            <form action={signInAs}>
              <input type="hidden" name="email" value={account.email} />
              <button
                type="submit"
                className="flex w-full flex-col items-start gap-0.5 rounded-box border border-base-300 bg-base-100 px-4 py-3 text-left transition-colors hover:border-primary"
              >
                <span className="font-semibold">{account.name}</span>
                <span className="text-sm text-muted">{account.email}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
