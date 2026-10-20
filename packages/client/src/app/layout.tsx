import type { Metadata } from "next";
import "./globals.css";
import { Roboto_Slab, Roboto_Condensed } from "next/font/google";
import ThemeApplier from "../components/ThemeApplier.tsx";

const robotoSlab = Roboto_Slab({
    subsets: ["latin"],
    variable: "--font-roboto-slab",
    display: "swap",
});

const robotoCondensed = Roboto_Condensed({
    subsets: ["latin"],
    variable: "--font-roboto-condensed",
    display: "swap",
});

export const metadata: Metadata = {
    title: "DHS Bell Schedule",
    description: "Scheduling app for high school",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" className={`${robotoSlab.variable} ${robotoCondensed.variable}`}>
        <body>
        <ThemeApplier/>
        {children}
        </body>
        </html>
    );
}
