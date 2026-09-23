import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-3 px-6">
      <h1 className="text-2xl">Nothing here you can open</h1>
      <p className="text-muted">
        Either this page does not exist, or it belongs to a brand you do not work on. We show the
        same message in both cases so it does not reveal which brands exist.
      </p>
      <Link href="/" className="btn self-start btn-sm">
        Go to your start page
      </Link>
    </main>
  );
}
