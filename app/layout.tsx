import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/chrome/SiteChrome";

// Google Fonts, self-hosted at build time by next/font: no render-blocking
// request, and metric-matched fallbacks so headlines don't jump on load.
// Geist + Geist Mono are the design's faces (variable, so weights like 620/650
// render exactly). Instrument Serif is only used by the dashboard/admin styles.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#000000",
  colorScheme: "dark",
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
