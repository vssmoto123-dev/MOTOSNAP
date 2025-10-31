import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MaintenanceGate from '@/components/MaintenanceGate';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MotoSnap - Motorcycle Workshop Management",
  description: "Professional motorcycle parts and service management system",
  keywords: "motorcycle, parts, service, workshop, management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <MaintenanceGate>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </MaintenanceGate>
      </body>
    </html>
  );
}
