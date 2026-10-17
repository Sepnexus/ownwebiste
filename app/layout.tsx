import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/chrome/SiteChrome";

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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}
