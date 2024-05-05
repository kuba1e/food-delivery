import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers/NextUiProvider";
import Header from "../components/Layout/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Poppins",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Food Delivery",
  description: "Order food online from local restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
      </body>
    </html>
  );
}
