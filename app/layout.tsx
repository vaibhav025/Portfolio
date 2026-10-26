import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./ui.css";

const shoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-shoulders", axes: ["opsz"], display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const title = "Vaibhav Singla | Video Editor & Technologist";
const description =
  "Portfolio of Vaibhav Singla - Video Editor, Technologist, and Leader based in Delhi. Blending technical expertise with creative visual storytelling.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vaibhav-singla-portfolio.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Vaibhav Singla",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Vaibhav Singla, Video Editor & Technologist" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${shoulders.variable} ${archivo.variable} ${jetbrains.variable} ${instrument.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
