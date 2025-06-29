import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://scanner.bitsandbots.in'),
  title: "BarCode Pro - Professional Barcode & Invoice Generator",
  description: "Generate barcodes, QR codes, scan codes, and create professional GST-compliant invoices. Perfect for businesses, retailers, and developers.",
  keywords: ["barcode generator", 
    "QR code", "invoice generator", "GST invoice", "barcode scanner",
    "BitsandBots", "BitsandBots.in", "BitsandBots.com", "BitsandBots.net", "BitsandBots.org", "BitsandBots.in", "BitsandBots.com", "BitsandBots.net", "BitsandBots.org",
    "Bits and bots products", "Bits and bots services", "Bits and bots solutions", "Bits and bots tools", "Bits and bots apps", "Bits and bots software", "Bits and bots services", "Bits and bots solutions", "Bits and bots tools", "Bits and bots apps", "Bits and bots software",
    "Bits and bots products", "Bits and bots services", "Bits and bots solutions", "Bits and bots tools", "Bits and bots apps", "Bits and bots software", "Bits and bots services", "Bits and bots solutions", "Bits and bots tools", "Bits and bots apps", "Bits and bots software",
    "Scanner", "Scanner.bitsandbots.in", "Scanner.bitsandbots.com", "Scanner.bitsandbots.net", "Scanner.bitsandbots.org", "Scanner.bitsandbots.in", "Scanner.bitsandbots.com", "Scanner.bitsandbots.net", "Scanner.bitsandbots.org",
    "QR Code Generator", "QR Code Generator Online", "QR Code Generator Free", "QR Code Generator Tool", "QR Code Generator App", "QR Code Generator Software", "QR Code Generator Online", "QR Code Generator Free", "QR Code Generator Tool", "QR Code Generator App", "QR Code Generator Software",
    "Barcode Generator", "Barcode Generator Online", "Barcode Generator Free", "Barcode Generator Tool", "Barcode Generator App", "Barcode Generator Software", "Barcode Generator Online", "Barcode Generator Free", "Barcode Generator Tool", "Barcode Generator App", "Barcode Generator Software",
    "Invoice Generator", "Invoice Generator Online", "Invoice Generator Free", "Invoice Generator Tool", "Invoice Generator App", "Invoice Generator Software", "Invoice Generator Online", "Invoice Generator Free", "Invoice Generator Tool", "Invoice Generator App", "Invoice Generator Software",
    "GST Invoice Generator", "GST Invoice Generator Online", "GST Invoice Generator Free", "GST Invoice Generator Tool", "GST Invoice Generator App", "GST Invoice Generator Software", "GST Invoice Generator Online", "GST Invoice Generator Free", "GST Invoice Generator Tool", "GST Invoice Generator App", "GST Invoice Generator Software",
    "Barcode Scanner", "Barcode Scanner Online", "Barcode Scanner Free", "Barcode Scanner Tool", "Barcode Scanner App", "Barcode Scanner Software", "Barcode Scanner Online", "Barcode Scanner Free", "Barcode Scanner Tool", "Barcode Scanner App", "Barcode Scanner Software",
    "Barcode Scanner App", "Barcode Scanner Software", "Barcode Scanner Online", "Barcode Scanner Free", "Barcode Scanner Tool", "Barcode Scanner App", "Barcode Scanner Software",
    "Barcode Scanner App", "Barcode Scanner Software", "Barcode Scanner Online", "Barcode Scanner Free", "Barcode Scanner Tool", "Barcode Scanner App", "Barcode Scanner Software",
    "barcode generator online", "QR code generator online", "invoice generator online", "GST invoice generator online", "barcode scanner online",
    "barcode generator free", "QR code generator free", "invoice generator free", "GST invoice generator free", "barcode scanner free",
    "barcode generator tool", "QR code generator tool", "invoice generator tool", "GST invoice generator tool", "barcode scanner tool",
    "barcode generator app", "QR code generator app", "invoice generator app", "GST invoice generator app", "barcode scanner app",
    "barcode generator software", "QR code generator software", "invoice generator software", "GST invoice generator software", "barcode scanner software",
    "barcode generator online", "QR code generator online", "invoice generator online", "GST invoice generator online", "barcode scanner online"],
  authors: [{ name: "BarCode Pro" }],
  creator: "BarCode Pro",
  publisher: "BarCode Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  applicationName: "Barcode & Invoice Generator",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BarcodeGen",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "BitsandBots - Professional Barcode/QR Scanner/Generator & Invoice Generator",
    description: "Generate barcodes, QR codes, scan codes, and create professional GST-compliant invoices.",
    url: "https://scanner.bitsandbots.in",
    siteName: "BarCode Pro",
    images: [
      {
        url: "/logo-removebg.png",
        width: 1200,
        height: 630,
        alt: "BarCode Pro Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarCode Pro - Professional Barcode & Invoice Generator",
    description: "Generate barcodes, QR codes, scan codes, and create professional GST-compliant invoices.",
    images: ["/logo-removebg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <meta name="google-adsense-account" content="ca-pub-7857255548980209" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7857255548980209"
     crossOrigin="anonymous"></script>
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BarcodeGen" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-900 transition-colors duration-300`}
      >
        <ServiceWorkerRegistration />
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
