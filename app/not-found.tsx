import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="flex-1 p-12 text-center">
      <h1 className="text-lg">Page not found ¯\_(ツ)_/¯</h1>
      <Link className="mt-5 inline-block text-link underline" href="/dashboard">
        Dashboard
      </Link>
    </main>
  );
}
