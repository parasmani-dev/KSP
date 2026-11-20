import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "KSP CIOS | Research Prototype",
  description: "Synthetic-data crime intelligence research prototype for Karnataka State Police.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="flex min-h-screen bg-background">
          <div className="hidden lg:block sticky top-0 h-screen z-40 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="sticky top-0 z-50">
              <TopNav />
            </div>
            <main id="main-content" className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
