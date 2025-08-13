import {Schedule} from "../../schedule.ts";

import styles from "../schedule.module.css"
import PeriodBlock from "./PeriodBlock.tsx";
import LunchBlock from "./LunchBlock.tsx";

interface TableProps {
    schedule: Schedule;
}

export default function Table(p: TableProps) {
    return (
        <>
            <table className={styles.schedule} style={{tableLayout: 'fixed', width: '200px'}}>
                <thead>
                <tr>
                    <td colSpan={3}>{p.schedule.name}</td>
                </tr>
                </thead>
                <tbody>
                {p.schedule.times.map((period, index) => {
                    if ('lunchBlock' in period && period.lunchBlock) {
                        return <LunchBlock key={index} times={period}/>;
                    } else if ('period' in period && 'start' in period && 'end' in period) {
                        return <PeriodBlock key={index} period={period}/>;
                    }
                    return null;
                })}
                </tbody>
            </table>
        </>
    );
}