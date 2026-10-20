import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Calendar Integration | DHS Bell Schedule",
};

export default function IcsGeneratorLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return children;
}
