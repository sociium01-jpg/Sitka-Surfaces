import type { Metadata } from "next";
import { Inter, Space_Grotesk, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MobileAppNav from "@/components/MobileAppNav";
import BrochureModal from "@/components/BrochureModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["italic", "normal"],
  weight: ["400", "500"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Sitka Surfaces | Premium Materials for Architects & Designers",
  description: "Sitka Surfaces engineered plywood core panels, high-pressure laminates, natural veneers, and decoratives are built for structural strength and lifetime visual character.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-stone">
        <ModalProvider>
          <Nav />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MobileAppNav />
          <BrochureModal />
        </ModalProvider>
      </body>
    </html>
  );
}
