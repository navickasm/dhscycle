'use client';

import React, { useEffect, useState } from "react";

interface HeadingProps {
    date: Date;
    h2: string | null;
    isToday?: boolean;
    onBackToToday?: () => void;
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

    const notToday = p.isToday === false;

    return (
        <>
            <h1 style={{
                textAlign: "center",
                color: notToday ? "var(--main)" : undefined,
            }}>{date}</h1>

            {notToday && (
                <div style={{textAlign: "center", marginTop: "4px"}}>
                    <button
                        onClick={p.onBackToToday}
                        style={{
                            padding: "6px 16px",
                            cursor: "pointer",
                            backgroundColor: "var(--light)",
                            color: "var(--fg)",
                            border: "2px solid var(--main)",
                            borderRadius: "6px",
                            fontSize: "1rem",
                            fontFamily: "inherit",
                        }}
                    >
                        Back to Today
                    </button>
                </div>
            )}

            {p.h2 && <h2 style={{ textAlign: "center" }}> {p.h2.split('%%').map((part, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {part}
                </React.Fragment>
            ))} </h2>}
        </>
    );
}
