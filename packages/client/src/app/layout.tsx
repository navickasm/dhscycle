import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script"; // Import the Script component
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

const GA_MEASUREMENT_ID = "G-ZVW0CT8HLY"; // Replace with your actual Measurement ID

export const metadata: Metadata = {
    title: "DHS Bell Schedule",
    description: "Scheduling app for high school",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" className={`${robotoSlab.variable} ${robotoCondensed.variable}`}>
        <head>
            <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                `}
            </Script>
        </head>
        <body>
        <ThemeApplier/>
        {children}
        </body>
        </html>
    );
}
