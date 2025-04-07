import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Supabase Auth - Next.js",
  description: "Authentication and profiles with Supabase and Next.js",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex space-x-6">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/profiles" className="hover:text-gray-300">All Profiles</Link>
            {session && (
              <Link href="/profile" className="hover:text-gray-300">My Profile</Link>
            )}
            <Link href="/auth" className="hover:text-gray-300">
              {session ? 'Account' : 'Sign In'}
            </Link>
          </div>
        </nav>
        <main className="container mx-auto py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
