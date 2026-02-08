import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import "@/core/plugins/register-plugins";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Breadcrumb from "./components/layout/Breadcrumb";
import { LoadingProvider, LoadingOverlay } from "./components/layout/LoadingOverlay";
import HomeBgLayer from "./components/home/HomeBgLayer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EXER",
  description: "Exercise the Mind, Master the Skill.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen flex-col pb-12">
        <LoadingProvider>
          <LoadingOverlay />
          <HomeBgLayer />
          <Header />
          <Breadcrumb />
          <main className="main-content flex-1">{children}</main>
          <Footer />
        </LoadingProvider>
      </body>
    </html>
  );
}
