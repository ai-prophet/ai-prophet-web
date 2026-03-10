import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "AI Prophet",
  description: "Harnessing AI to illuminate our path ahead",
  icons: {
    icon: "/assets/icon-192.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "AI Prophet",
    description: "Harnessing AI to illuminate our path ahead",
    siteName: "AI Prophet",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prophet",
    description: "Harnessing AI to illuminate our path ahead",
    images: ["/assets/og-image.png"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        <Auth0Provider>
          <ThemeProvider>{children}</ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
