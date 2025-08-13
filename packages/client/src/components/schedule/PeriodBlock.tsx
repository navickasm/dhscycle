import Timer from "./Timer.tsx"
import styles from "../schedule.module.css";
import {JSX} from "react";

export interface PeriodBlockProps {
    period: {
        period: string;
        start: string;
        end: string;
    };
    type?: "normal" | "vertical" | "big" | "horiz";
}

function to12Hr(time24: string): string {
    const [hours, minutes] = time24.split(":").map(Number);
    return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")}`;
}

export function preferredPeriodName(period: string): JSX.Element {
    if (period === "SC") {
        return <span className={styles.pn} style={{ fontSize: "14pt", lineHeight: "1.0", display: "inline-block" }}>Staff Collab</span>;
    } else if (period == "FO") {
        return <span className={styles.pn} style={{ fontSize: "14pt", lineHeight: "5.0", display: "inline-block" }}>Orientation</span>;
    }
    if (period.substring(0,1) == "L") {
        return <span className={styles.ln}>Lunch {period.substring(1)}</span>;
    }
    return <span className={styles.pn}>{period}</span>;
}

export function PeriodBlockContent(p: PeriodBlockProps): JSX.Element {
    return (
        <td colSpan={p.type === "vertical" ? 1 : p.type === "big" ? 2 : p.type === "horiz" ? 2 : 3}
            rowSpan={p.type === "vertical" ? 2 : p.type === "big" ? 2 : p.type === "horiz" ? 1 : 1}
            height={p.type == "vertical" ? 120 : p.type === "big" ? 120 : undefined}>
            <div style={{
                display: "flex",
                flexDirection: p.type === "vertical" ? "column" : "row",
                justifyContent: p.type === "vertical" ? "center" : "space-between",
                alignItems: "center",
                position: "relative"
            }}>
                <div>
                    {preferredPeriodName(p.period.period)}
                </div>
                <span className={styles.pt} style={p.type === "vertical" ? { marginTop: "8px" } : undefined}>
                    {to12Hr(p.period.start)}–{ (p.type === "vertical" || p.type === "big") && (<br/>)}{to12Hr(p.period.end)}
                </span>
            </div>
            <Timer start={p.period.start} end={p.period.end} />
        </td>
    );
}

export default function PeriodBlock(p: PeriodBlockProps): JSX.Element {
    return (
        <tr>
            {PeriodBlockContent(p)}
        </tr>
    );
}