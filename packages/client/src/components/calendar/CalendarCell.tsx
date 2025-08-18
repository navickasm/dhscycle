import React, {JSX} from 'react';

type ScheduleType = 'A' | '16' | '27' | '38' | '45' | 'other';
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
};

const getScheduleTypeColor = (type: ScheduleType | undefined): string => {
    switch (type) {
        case 'A':
            return '#1155cc';
        case '16':
            return '#e69138';
        case '27':
            return '#38761d';
        case '38':
            return '#351c75';
        case '45':
            return '#cc0000';
        default:
            return '#666666';
    }
};

function YesSchoolBottom(p: CalendarCellProps): JSX.Element {
    console.log(p.specialModifications);
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
                    }}>{mod}</p>
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
                color: getScheduleTypeColor(p.scheduleType),
                fontWeight: "bold",
                fontSize: "2rem",
                marginBottom: "-0.17em"
            }}>
                {p.scheduleType === "other" ? "S" : p.scheduleType}{p.isSpecial && <>*</>}
            </span>
        </div>
    );
}

function NoSchoolBottom(p: CalendarCellProps): JSX.Element {
    return (
        <>
            <p style={{fontWeight: "bold"}}>NO SCHOOL</p>
            {p.noSchoolReason && (
                <p>{p.noSchoolReason}</p>
            )}
        </>
    );
}

export function CalendarCell(p: CalendarCellProps): JSX.Element {
    const dayNumber = p.date.getDate();

    // TODO make the specialNote more efficient
    return (
        <>
            <td style={{
                height: '7rem',
                padding: '0.5rem',
                width: '140px',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
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
                        }}>{p.specialNote}</p>
                        <p style={{
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                            margin: 0,
                            padding: 0,
                            marginTop: '-0.1em'
                        }}>{dayNumber}</p>
                    </div>

                    { p.isNoSchool ? <NoSchoolBottom {...p} /> : <YesSchoolBottom {...p} /> }
                </div>
            </td>
        </>
    );
}