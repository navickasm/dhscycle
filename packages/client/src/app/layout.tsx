import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "DHS Bell Schedule",
    description: "Scheduling app for high school",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body>
            {children}
            </body>
        </html>
    );
}
