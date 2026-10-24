import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { Suspense } from "react";

import { CartDrawer } from "@/components/commerce/CartDrawer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader, SiteHeaderView } from "@/components/layout/SiteHeader";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { localBusinessJsonLd, organizationJsonLd } from "@/lib/seo";

import "./globals.css";

// Loaded without the optical-size axis on purpose: the default instance is Bodoni's sturdy
// text cut (opsz 11). The display cuts' hairlines disappear on screens and dark backgrounds.
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Signiorina — Modern Italian-Inspired Charcuterie + Hospitality in the Smokies",
    template: "%s · Signiorina",
  },
  description:
    "Modern Italian-inspired grazing for Smoky Mountain weddings, cabin weekends, office lunches and tables worth gathering around. Sevierville, Pigeon Forge, Gatlinburg and Knoxville.",
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "en_US", type: "website" },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#41483a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal-on-scroll styles only when JavaScript runs. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={localBusinessJsonLd()} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-olive px-5 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <StoreHydrator />
        {/* Path-aware chrome sits in Suspense so routes with request-time params still prerender. */}
        <Suspense fallback={<SiteHeaderView pathname={null} />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Suspense fallback={null}>
          <MobileActionBar />
        </Suspense>
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      </body>
    </html>
  );
}
