import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ReactQueryProvider } from "@/lib/query-provider";
import { Navbar } from "@/components/layout/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus Issue Tracker | University Facilities & Incident Management",
  description:
    "Report, track, and manage campus facilities, electrical, internet, and infrastructure issues seamlessly.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <ReactQueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4">
                &copy; {new Date().getFullYear()} Campus Issue Tracker &bull; University Infrastructure &amp; Facilities Management
              </div>
            </footer>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
