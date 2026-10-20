// src/components/schedule/LunchBlock.tsx
import styles from "../schedule.module.css";
import {durationTitle, PeriodBlockContent, preferredPeriodName, to12Hr} from "./PeriodBlock.tsx";
import type { LunchBlock } from "../../schedule.ts";
import {JSX} from "react";
import Timer from "./Timer.tsx";

interface LunchBlockProps {
    times: LunchBlock;
    showTimer?: boolean;
}

function Lunch({ period, showTimer }: { period: any; showTimer?: boolean }) {
    return (
        <td className={styles.lunch} title={showTimer === false ? durationTitle(period.start, period.end) : undefined}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                height: "100%"
            }}>
                {preferredPeriodName(period.period)}
                <span className={styles.pt} style={{ textAlign: "center", lineHeight: "0.9" }}>
                    {to12Hr(period.start)}
                    <br />–<br/>
                    {to12Hr(period.end)}
                </span>
            </div>
            {showTimer !== false && <Timer start={period.start} end={period.end} />}
        </td>
    );
}

function FakeLunch() {
    return (
        <td className={styles.fakeLunch}></td>
    );
}

function NormalLunch(p: LunchBlockProps): JSX.Element {
    return (
        <>
            <tr>
                <Lunch period={p.times.lunches[0]} showTimer={p.showTimer}/>
                <PeriodBlockContent period={p.times.periods[0]} type={"big"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <PeriodBlockContent period={p.times.periods[1]} type={"vertical"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[1]} showTimer={p.showTimer}/>
                <PeriodBlockContent period={p.times.periods[2]} type={"vertical"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <PeriodBlockContent period={p.times.periods[3]} type={"big"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[2]} showTimer={p.showTimer}/>
            </tr>
        </>
    );
}

function FridayLunch(p: LunchBlockProps): JSX.Element {
    return (
        <>
            <tr>
                <FakeLunch />
                <PeriodBlockContent period={p.times.periods[0]} type={"big"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[0]} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[1]} showTimer={p.showTimer}/>
                <PeriodBlockContent period={p.times.periods[1]} type={"vertical"} showTimer={p.showTimer}/>
                <FakeLunch />
            </tr>
            <tr>
                <FakeLunch />
                <PeriodBlockContent period={p.times.periods[2]} type={"vertical"} showTimer={p.showTimer}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[2]} showTimer={p.showTimer}/>
                <FakeLunch />
            </tr>
        </>
    );
}

export default function LunchBlock(p: LunchBlockProps) {
    if (p.times.type === "normal" || !p.times.type) {
        return <NormalLunch times={p.times} showTimer={p.showTimer} />
    } else if (p.times.type === "friday") {
        return <FridayLunch times={p.times} showTimer={p.showTimer} />
    } else {
        console.error("Problem with lunch block type:", p.times.type);
        return <></>;
    }
}