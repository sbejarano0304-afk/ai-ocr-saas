import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Extractify | AI OCR SaaS",
  description: "Upload documents and extract structured data instantly using state-of-the-art AI OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
            <div className="container mx-auto flex h-16 items-center px-4">
              <div className="flex font-bold text-xl items-center gap-2">
                <span className="text-primary">⬡</span> Extractify
              </div>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <nav className="flex items-center space-x-2">
                  <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer px-4 py-2">
                    Login
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
                    Dashboard
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
