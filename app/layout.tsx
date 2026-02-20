import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ShellClient from "@/components/ShellClient";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A1628" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1628" },
  ],
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "YachtDrop — Marine Parts Delivered",
    template: "%s | YachtDrop",
  },
  description:
    "Order boat parts and marine supplies for delivery to your berth or pickup. " +
    "Built for yacht crew.",
  applicationName: "YachtDrop",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YachtDrop",
    startupImage: [
      {
        url: "/splash/apple-splash-2796-1290.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-2556-1179.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-2532-1170.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: "YachtDrop",
    title: "YachtDrop — Marine Parts Delivered",
    description: "Order boat parts for delivery to your berth.",
    url: "https://yachtdrop.vercel.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YachtDrop",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#0E7C7B"
        />
        <meta name="msapplication-TileColor" content="#0A1628" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />
      </head>
      <body className="bg-brand-surface">
        {" "}
        {/* ← removed max-width constraint */}
        <Providers>
          <ShellClient>{children}</ShellClient>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  `,
          }}
        />
      </body>
    </html>
  );
}
