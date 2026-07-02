"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Core workflow",
    emphasis: "primary",
    links: [
      ["Dashboard", "/"],
      ["Industries", "/industries"],
      ["Opportunities", "/opportunities"],
      ["Validation", "/validation-packages"],
      ["Product Concepts", "/product-concepts"],
    ],
  },
  {
    label: "Research tools",
    emphasis: "secondary",
    links: [
      ["Research Sessions", "/research-sessions"],
      ["Industry Pipeline", "/industry-pipeline"],
      ["Workflows", "/workflows"],
      ["Software Products", "/products"],
      ["Evidence", "/evidence"],
      ["Evidence Patterns", "/evidence-clusters"],
      ["Pain Points", "/pain-points"],
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
        <div className={`nav-group nav-${group.emphasis}`} key={group.label}>
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
