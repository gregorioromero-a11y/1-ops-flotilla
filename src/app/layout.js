import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

// Inter: texto y tablas. Space Grotesk: números y títulos (aire técnico).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "T1 Ops — Consola de Despacho",
  description: "Control room de operaciones de última milla",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
