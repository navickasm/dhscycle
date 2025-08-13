'use client';

import { useEffect, useState } from "react";

interface HeadingProps {
    date: Date;
    h2: string | null;
}

export default function Heading(p: HeadingProps) {
    const [date, setDate] = useState("");

    useEffect(() => {
        const centralTime = p.date.toLocaleString("en-US", {
            timeZone: "America/Chicago",
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        setDate(centralTime);

    }, [p.date]);

    return (
        <>
            <h1 style={{ textAlign: "center" }}>{date}</h1>
            {p.h2 && <h2 style={{ textAlign: "center" }}>{p.h2}</h2>}
        </>
    );
}