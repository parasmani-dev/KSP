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
        <div className="flex flex-col min-h-screen bg-background">
          <div className="sticky top-0 z-50">
            <TopNav />
          </div>
          <div className="flex flex-1">
            <div className="sticky top-16 h-[calc(100vh-4rem)] z-40">
              <Sidebar />
            </div>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
