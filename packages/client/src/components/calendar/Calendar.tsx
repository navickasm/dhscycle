import {CalendarCell, CalendarCellProps} from "./CalendarCell.tsx";

import styles from "./calendar.module.css";

export interface CalendarProps {
    cells: CalendarCellProps[];
}

export default function Calendar(p: CalendarProps) {
    if (!p.cells || p.cells.length === 0) {
        return <p><b>Error:</b> No calendar data available.</p>;
    }

    const paddingNeeded = p.cells[0].date.getUTCDay() - 1;

    return (
        <table style={{padding: "1rem", margin: "0 auto"}}>
            <thead>
            <tr>
                <th colSpan={5}>{new Intl.DateTimeFormat('en-US', {month: 'long'}).format(p.cells[0].date)}</th>
            </tr>
            </thead>
            <tbody>

            <tr>
                <th className={styles.tableLabel}>M</th>
                <th className={styles.tableLabel}>T</th>
                <th className={styles.tableLabel}>W</th>
                <th className={styles.tableLabel}>H</th>
                <th className={styles.tableLabel}>F</th>
            </tr>

            {Array.from({length: Math.ceil((paddingNeeded + p.cells.length) / 5)}).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                    {Array.from({length: 5}).map((_, colIndex) => {
                        const cellIndex = rowIndex * 5 + colIndex;
                        if (cellIndex < paddingNeeded) {
                            return <td key={`padding-${cellIndex}`}/>;
                        }
                        const cell = p.cells[cellIndex - paddingNeeded];
                        return cell ? <CalendarCell key={cellIndex} {...cell}/> : <td key={`empty-${cellIndex}`}/>;
                    })}
                </tr>
            ))}
            </tbody>
        </table>
    );
};