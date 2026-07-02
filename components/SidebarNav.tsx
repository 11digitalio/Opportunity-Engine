"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Core workflow",
    emphasis: "primary",
    sections: [
      {
        label: undefined,
        links: [
          ["Dashboard", "/"],
          ["Industries", "/industries"],
          ["Opportunities", "/opportunities"],
          ["Product Concepts", "/product-concepts"],
          ["Validation", "/validation-packages"],
        ],
      },
    ],
  },
  {
    label: "Research tools",
    emphasis: "secondary",
    sections: [
      {
        label: "Research management",
        links: [
          ["Research Sessions", "/research-sessions"],
          ["Industry Pipeline", "/industry-pipeline"],
        ],
      },
      {
        label: "Market map",
        links: [
          ["Workflows", "/workflows"],
          ["Software Products", "/products"],
        ],
      },
      {
        label: "Research process",
        links: [
          ["Evidence", "/evidence"],
          ["Evidence Patterns", "/evidence-clusters"],
          ["Pain Points", "/pain-points"],
        ],
      },
      {
        label: "Validation records",
        links: [
          ["Interviews", "/interviews"],
          ["Experiments", "/experiments"],
        ],
      },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Primary navigation">
      {groups.map((group) => {
        const content = group.sections.map((section, index) => (
          <div className="nav-subgroup" key={section.label ?? index}>
            {section.label && <span className="nav-subgroup-label">{section.label}</span>}
            {section.links.map(([label, href]) => {
              const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return <Link className={active ? "active" : ""} aria-current={active ? "page" : undefined} key={href} href={href}>{label}</Link>;
            })}
          </div>
        ));
        if (group.emphasis === "secondary") {
          const researchActive = group.sections.some((section) => section.links.some(([, href]) => pathname === href || pathname.startsWith(`${href}/`)));
          return <details className="nav-group nav-secondary" key={group.label} open={researchActive || undefined}>
            <summary className="nav-label">Research workspace</summary>
            <div className="nav-secondary-content">{content}</div>
          </details>;
        }
        return <div className="nav-group nav-primary" key={group.label}><span className="nav-label">{group.label}</span>{content}</div>;
      })}
    </nav>
  );
}
