import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Administrador | SitioHoy",
  description: "Panel de administración SitioHoy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="flex h-full min-h-screen bg-black text-foreground overflow-hidden" suppressHydrationWarning>
        {/* Umami Analytics */}
        {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
        {/* Global Noise Overlay */}
        <div className="bg-noise absolute inset-0 z-0"></div>
        <div className="relative z-10 flex h-full w-full">
          {children}
        </div>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
