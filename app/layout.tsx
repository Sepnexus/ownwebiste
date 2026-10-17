import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/chrome/SiteChrome";

// Self-hosted at build time: no render-blocking request to Google, and
// metric-matched fallbacks so the big headline doesn't jump when fonts load.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f6f3ec",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Sepnexus — AI agents & automation for real estate investors",
    template: "%s · Sepnexus",
  },
  description:
    "Sepnexus builds AI agents, automation and custom software for real estate investors and growing businesses: AI texting and calling, lead qualification, comping and underwriting tools, KPI dashboards and managed hosting.",
  metadataBase: new URL(process.env.PUBLIC_BASE_URL ?? "https://sepnexus.com"),
  openGraph: {
    title: "Sepnexus — AI agents & automation for real estate investors",
    description:
      "AI agents that text, call and qualify leads, plus comping tools, KPI dashboards and managed hosting — built for real estate investors and growing businesses.",
    url: "/",
    siteName: "Sepnexus",
    type: "website",
  },
  icons: {
    icon: "/assets/sepnexus-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}
