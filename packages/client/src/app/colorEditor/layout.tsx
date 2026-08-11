import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Color Suite | DHS Bell Schedule",
};

export default function ColorEditorLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return children;
}
