import type { Metadata } from "next";
import DataSourcePanel from "@/components/DataSourcePanel";
import SidebarNav from "@/components/SidebarNav";
import WelcomeOnboarding from "@/components/WelcomeOnboarding";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opportunity Engine",
  description: "Discover startup opportunities from real customer pain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand"><span>OE</span><div>Opportunity Engine<small>Evidence-first research system</small></div></div>
            <SidebarNav />
            <div className="sidebar-flow" aria-label="Opportunity workflow">
              <span>Evidence</span><i>→</i><span>Pattern</span><i>→</i><strong>Opportunity</strong>
            </div>
          </aside>
          <main className="main">{children}</main>
          <DataSourcePanel />
        </div>
        <WelcomeOnboarding />
      </body>
    </html>
  );
}
