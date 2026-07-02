import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opportunity Engine",
  description: "Local-first vertical SaaS research workspace",
};

const links = [
  ["Dashboard", "/"],
  ["Industry Pipeline", "/industry-pipeline"],
  ["Research Sessions", "/research-sessions"],
  ["Industries", "/industries"],
  ["Workflows", "/workflows"],
  ["Software Products", "/products"],
  ["Evidence", "/evidence"],
  ["Evidence Clusters", "/evidence-clusters"],
  ["Pain Points", "/pain-points"],
  ["Opportunities", "/opportunities"],
  ["Product Concepts", "/product-concepts"],
  ["Validation Packages", "/validation-packages"],
  ["Interviews", "/interviews"],
  ["Experiments", "/experiments"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">Opportunity Engine</div>
            <nav className="nav">
              {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
