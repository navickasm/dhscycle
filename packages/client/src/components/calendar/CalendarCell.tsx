import React, {JSX} from 'react';

import styles from "./calendar.module.css";

type ScheduleType = 'A' | '16' | '27' | '38' | '45' | 'other' | 's1finals' | 's2finals';
type StartTime = '8:20' | '8:40' | 'other';

export type CalendarCellProps =
    | { // Yes school
    date: Date;
    startTime: StartTime;
    specialNote?: string;
    specialModifications?: string[];
    scheduleType: ScheduleType;
    isSpecial?: boolean;
    isNoSchool?: false;
    noSchoolReason?: never;
    isToday?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}
    | { // No school
    date: Date;
    startTime?: never;
    specialNote?: string;
    specialModifications?: string[];
    isSpecial?: never;
    scheduleType?: never;
    isNoSchool: true;
    noSchoolReason?: string;
    isToday?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
};

const scheduleTypeColors: { [key in ScheduleType | 'default']?: string } = {
    'A':  '#1155cc',
    '16': '#e69138',
    '27': '#38761d',
    '38': '#351c75',
    '45': '#cc0000',
    'default': '#666666',
};

export const scheduleTypeColorsPastel: { [key in ScheduleType | 'default']?: string } = {
    'A':  '#1155cc22',
    '16': '#e6913822',
    '27': '#38761d22',
    '38': '#351c7522',
    '45': '#cc000022',
    'default': '#ffffff',
};

function YesSchoolBottom(p: CalendarCellProps): JSX.Element {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '10px',
            height: '100%',
            alignItems: 'flex-end'
        }}>
            <div>
                {p.specialModifications && p.specialModifications.map((mod, index) => (
                    <p key={index} style={{
                        fontSize: '.725rem'
                    }}>
                        {mod.split('%%').map((part, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br/>}
                                {part}
                            </React.Fragment>
                        ))}
                    </p>
                ))}

                {p.startTime && p.startTime != "other" && (
                    <p style={{
                        color: p.startTime == "8:40" ? "#d51737" : "#7917d5",
                        fontWeight: "bold"
                    }}
                       title={p.startTime == "8:40" ? "8:40 AM start" : "8:20 AM start"}>{p.startTime}</p>
                )}
            </div>

            <span style={{
                color: scheduleTypeColors[p.scheduleType ?? 'default'],
                fontWeight: "bold",
                fontSize: "2rem",
                marginBottom: "-0.17em"
            }}>
                {['s1finals', 's2finals'].includes(p.scheduleType ?? '') ? "Finals" : (p.scheduleType === "other" ? "S" : p.scheduleType)}{p.isSpecial && <>*</>}
            </span>
        </div>
    );
}

function NoSchoolBottom(p: CalendarCellProps): JSX.Element {
    return (
        <>
            <p style={{fontWeight: "bold"}}>NO SCHOOL</p>
            {p.noSchoolReason && (
                <p>{p.noSchoolReason.split('%%').map((part, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <br/>}
                        {part}
                    </React.Fragment>
                ))}</p>
            )}
        </>
    );
}

export function CalendarCell(p: CalendarCellProps): JSX.Element {
    const dayNumber = p.date.getUTCDate();

    const border = p.isToday
        ? '3px solid var(--main)'
        : p.isSelected
            ? '3px dashed var(--main)'
            : undefined;

    // TODO make the specialNote more efficient
    return (
        <>
            <td
                className={p.onSelect ? styles.clickableCell : undefined}
                onClick={p.onSelect}
                title={p.isToday ? "Today" : "Click to view this day's schedule"}
                style={{
                    height: '7rem',
                    padding: '0.5rem',
                    width: '140px',
                    minWidth: '140px',
                    backgroundColor: scheduleTypeColorsPastel[p.scheduleType ?? 'default'],
                    border: border,
                    cursor: p.onSelect ? 'pointer' : undefined,
                }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: '10px',
                        height: '100%',
                        alignItems: 'flex-start'
                    }}>
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#3468bd",
                            margin: 0,
                            padding: 0
                        }}>{p.specialNote?.split('%%').map((part, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br/>}
                                {part}
                            </React.Fragment>
                        ))}</p>
                        <p style={{
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                            margin: 0,
                            padding: 0,
                            marginTop: '-0.1em'
                        }}>{dayNumber}</p>
                    </div>

                    {p.isNoSchool ? <NoSchoolBottom {...p} /> : <YesSchoolBottom {...p} />}
                </div>
            </td>
        </>
    );
}
