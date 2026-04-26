import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SentinelReview",
  description: "Vigilance Starts with Clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
        {/* Fixed Background */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1a2a44_0%,#050507_70%)] z-[-2]"></div>
        
        {/* Grid Overlay */}
        <div className="fixed inset-0 grid-overlay pointer-events-none opacity-20 z-[-1]"></div>

        {/* Auth-aware layout shell */}
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
