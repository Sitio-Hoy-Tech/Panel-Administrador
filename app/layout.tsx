import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Administrador | SitioHoy",
  description: "Panel de administración SitioHoy",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="flex h-full min-h-screen bg-[#020617] text-foreground overflow-hidden relative" suppressHydrationWarning>
        {/* Umami Analytics */}
        {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
        
        {/* Ambient Glowing Blobs Container to Prevent Page Overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] animate-float-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px] animate-float-slower"></div>
          <div className="absolute top-[30%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-purple-600/5 blur-[100px] animate-pulse-slow"></div>
        </div>

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
