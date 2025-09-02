import React from "react";
import styles from "../schedule.module.css";

export interface ThisWeekSchedule { day: string; scheduleName: string }

interface ThisWeekProps {
    schedule: ThisWeekSchedule[];
}

export default function ThisWeek(p: ThisWeekProps) {
    return (
        <>
            <table className={styles.thisWeek}>
                <thead>
                <tr>
                    <td colSpan={2}>This Week's Schedule</td>
                </tr>
                </thead>
                <tbody>
                {p.schedule.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.day}</td>
                        <td style={{minWidth: "144px"}}>
                            {entry.scheduleName.split('%%').map((part, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <br/>}
                                    {part}
                                </React.Fragment>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
}