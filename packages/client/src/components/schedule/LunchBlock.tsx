// src/components/schedule/LunchBlock.tsx
import styles from "../schedule.module.css";
import {PeriodBlockContent, preferredPeriodName, to12Hr} from "./PeriodBlock.tsx";
import type { LunchBlock } from "../../schedule.ts";
import {JSX} from "react";
import Timer from "./Timer.tsx";

interface LunchBlockProps {
    times: LunchBlock;
}

function Lunch({ period }: { period: any }) {
    return (
        <td className={styles.lunch}>
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
            <Timer start={period.start} end={period.end} />
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
                <Lunch period={p.times.lunches[0]}/>
                <PeriodBlockContent period={p.times.periods[0]} type={"big"}/>
            </tr>
            <tr>
                <PeriodBlockContent period={p.times.periods[1]} type={"vertical"}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[1]}/>
                <PeriodBlockContent period={p.times.periods[2]} type={"vertical"}/>
            </tr>
            <tr>
                <PeriodBlockContent period={p.times.periods[3]} type={"big"}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[2]}/>
            </tr>
        </>
    );
}

function FridayLunch(p: LunchBlockProps): JSX.Element {
    return (
        <>
            <tr>
                <FakeLunch />
                <PeriodBlockContent period={p.times.periods[0]} type={"big"}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[0]}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[1]}/>
                <PeriodBlockContent period={p.times.periods[1]} type={"vertical"}/>
                <FakeLunch />
            </tr>
            <tr>
                <FakeLunch />
                <PeriodBlockContent period={p.times.periods[2]} type={"vertical"}/>
            </tr>
            <tr>
                <Lunch period={p.times.lunches[2]}/>
                <FakeLunch />
            </tr>
        </>
    );
}

export default function LunchBlock(p: LunchBlockProps) {
    if (p.times.type === "normal" || !p.times.type) {
        return <NormalLunch times={p.times} />
    } else if (p.times.type === "friday") {
        return <FridayLunch times={p.times} />
    } else {
        console.error("Problem with lunch block type:", p.times.type);
        return <></>;
    }
}