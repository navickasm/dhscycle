import React from "react";
import styles from "../schedule.module.css";
import calendarStyles from "../calendar/calendar.module.css";
import {scheduleTypeColorsPastel} from "../calendar/CalendarCell.tsx";

export interface ThisWeekSchedule { day: string; scheduleName: string }

interface ThisWeekProps {
    schedule: ThisWeekSchedule[];
    weekDates?: string[];
    todayDate?: string;
    selectedDate?: string;
    onSelectDate?: (dateStr: string) => void;
}

export default function ThisWeek(p: ThisWeekProps) {
    const isCurrentWeek = !p.weekDates || !p.todayDate || p.weekDates.includes(p.todayDate);
    const weekTitle = isCurrentWeek
        ? "This Week's Schedule"
        : `Week of ${new Date(`${p.weekDates![0]}T12:00:00`).toLocaleString("en-US", {month: "long", day: "numeric"})}`;

    return (
        <>
            <table className={styles.thisWeek}>
                <thead>
                <tr>
                    <td colSpan={2}>{weekTitle}</td>
                </tr>
                </thead>
                <tbody>
                {p.schedule.map((entry, index) => {
                    const dateStr = p.weekDates?.[index];
                    const clickable = !!(dateStr && p.onSelectDate);
                    const isToday = !!dateStr && dateStr === p.todayDate;
                    const isSelected = !!dateStr && dateStr === p.selectedDate;

                    return (
                        <tr
                            key={index}
                            className={clickable ? calendarStyles.clickableCell : undefined}
                            onClick={clickable ? () => p.onSelectDate!(dateStr!) : undefined}
                            title={clickable ? (isToday ? "Today" : "Click to view this day's schedule") : undefined}
                            style={{
                                cursor: clickable ? "pointer" : undefined,
                                position: "relative",
                                outline: isToday
                                    ? "3px solid var(--main)"
                                    : isSelected
                                        ? "3px dashed var(--main)"
                                        : undefined,
                                outlineOffset: "-3px",
                            }}
                        >
                            <td>{entry.day}</td>
                            <td
                                style={{
                                    minWidth: "144px",
                                    backgroundColor: (() => {
                                        const firstLine = entry.scheduleName.split('%%')[0];
                                        if (firstLine === "Anchor Day") {
                                            return scheduleTypeColorsPastel["A"];
                                        }
                                        if (firstLine.startsWith("Cycle ")) {
                                            const cycleNumber = firstLine.split(" ")[1] as keyof typeof scheduleTypeColorsPastel;
                                            return scheduleTypeColorsPastel[cycleNumber] || scheduleTypeColorsPastel["default"];
                                        }
                                        return scheduleTypeColorsPastel["default"];
                                    })(),
                                }}
                            >
                                {entry.scheduleName.split('%%').map((part, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <br/>}
                                        {part}
                                    </React.Fragment>
                                ))}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </>
    );
}
