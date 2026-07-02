import type { Metadata } from "next";
import SidebarNav from "@/components/SidebarNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opportunity Engine",
  description: "Local-first vertical SaaS research workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand"><span>OE</span><div>Opportunity Engine<small>From signal to decision</small></div></div>
            <SidebarNav />
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
