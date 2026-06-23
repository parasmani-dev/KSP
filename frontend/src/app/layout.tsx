import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CIOS - Crime Intelligence Operating System",
  description: "AI-powered crime intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen bg-background">
          <div className="sticky top-0 h-screen z-40 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="sticky top-0 z-50">
              <TopNav />
            </div>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
