// Authentication is stubbed: these are the seeded people you can switch between.
// What each of them can see is decided by RLS, not by this list.
export const demoAccounts = [
  { email: "marta@sellervate.test", name: "Marta Ruiz", role: "Team lead" },
  { email: "nuria@sellervate.test", name: "Nuria Campos", role: "Team lead" },
  { email: "dani@sellervate.test", name: "Dani Ortega", role: "Specialist" },
  { email: "aisha@sellervate.test", name: "Aisha Bello", role: "Specialist" },
  { email: "tomas@sellervate.test", name: "Tomás Vidal", role: "Specialist" },
] as const;

export type DemoAccount = (typeof demoAccounts)[number];

export const demoEmails = demoAccounts.map((account) => account.email) as [
  DemoAccount["email"],
  ...DemoAccount["email"][],
];
