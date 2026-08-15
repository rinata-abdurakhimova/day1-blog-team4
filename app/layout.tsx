import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Research Admin",
  description: "Admin panel for blog trend research",
};

// The admin reads rows that the research Skill writes straight into Supabase,
// so nothing here may be prerendered at build time. Set on the root layout so
// every nested route renders per request.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-gray-100">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-8 pb-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
