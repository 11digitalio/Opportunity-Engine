import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card empty">
      <h1>Page not found</h1>
      <p className="subtitle">This section does not exist.</p>
      <p><Link href="/">Return to dashboard</Link></p>
    </div>
  );
}
