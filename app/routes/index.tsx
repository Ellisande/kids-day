import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <Link
        to="/days/"
        className="rounded border-2 border-slate-500 bg-emerald-400 p-2"
      >
        View Today
      </Link>
    </main>
  );
}
