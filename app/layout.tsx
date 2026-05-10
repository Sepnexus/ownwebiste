import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/chrome/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "Sepnexus — The infrastructure of intelligent work",
    template: "%s · Sepnexus",
  },
  description:
    "Sepnexus is a studio building autonomous agents, end-to-end automation and managed cloud for teams who refuse the status quo.",
  metadataBase: new URL(process.env.PUBLIC_BASE_URL ?? "https://sepnexus.com"),
  openGraph: {
    title: "Sepnexus — The infrastructure of intelligent work",
    description:
      "A studio building autonomous agents, end-to-end automation and resilient cloud systems.",
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
    <html lang="en">
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
