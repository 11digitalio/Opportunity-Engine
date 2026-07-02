"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Explore",
    links: [
      ["Dashboard", "/"],
      ["Industries", "/industries"],
      ["Industry Pipeline", "/industry-pipeline"],
      ["Research Sessions", "/research-sessions"],
    ],
  },
  {
    label: "Research",
    links: [
      ["Workflows", "/workflows"],
      ["Software Products", "/products"],
      ["Evidence", "/evidence"],
      ["Evidence Patterns", "/evidence-clusters"],
      ["Pain Points", "/pain-points"],
    ],
  },
  {
    label: "Decide",
    links: [
      ["Opportunities", "/opportunities"],
      ["Product Concepts", "/product-concepts"],
    ],
  },
  {
    label: "Validate",
    links: [
      ["Validation Plans", "/validation-packages"],
      ["Interviews", "/interviews"],
      ["Experiments", "/experiments"],
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Primary navigation">
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <span className="nav-label">{group.label}</span>
          {group.links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return <Link className={active ? "active" : ""} aria-current={active ? "page" : undefined} key={href} href={href}>{label}</Link>;
          })}
        </div>
      ))}
    </nav>
  );
}
