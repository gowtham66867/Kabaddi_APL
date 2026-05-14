import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AIChatAssistant from "@/components/AIChatAssistant";
import SessionTracker from "@/components/SessionTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KabaddiArena - Fan Engagement Platform",
  description: "Gamified fan engagement platform for Pro Kabaddi League. Predict, compete, and earn rewards!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <Navbar />
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 md:ml-60">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </div>
        </main>
        <AIChatAssistant />
        <SessionTracker />
      </body>
    </html>
  );
}
