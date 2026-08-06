import {DateTime} from 'luxon';
import {getDb} from "../database.js";
import {WeekDayName} from "../types/schedule.js";

interface WeekRow {
    date: string;
    regularity: string;
    schedule_name: string | null;
}

export function fetchWeekNamesFromDb(dateStr: string): WeekDayName[] {
    if (!dateStr) throw new Error("Date string is required.");

    const weekStart = DateTime.fromISO(dateStr).plus({days: 2}).set({weekday: 1}).toISODate();
    const weekEnd = DateTime.fromISO(dateStr).plus({days: 6}).set({weekday: 5}).toISODate();

    const rows = getDb().prepare<[string, string], WeekRow>(
        `SELECT DISTINCT
            s.date,
            s.regularity,
            CASE
                WHEN s.regularity NOT IN ('special', 'no', 's1finals', 's2finals')
                    THEN (
                        SELECT rs.name
                        FROM regular_schedules rs
                        WHERE rs.regularity = s.regularity
                    )
                ELSE s.special_schedule_name
            END AS schedule_name
        FROM schedules s
        WHERE s.date BETWEEN ? AND ?;`
    ).all(weekStart!, weekEnd!);

    return Array.from({length: 5}, (_, i) => {
        const currentDate = DateTime.fromISO(weekStart!).plus({days: i});
        const dayOfWeek = currentDate.toFormat('cccc');
        const entry = rows.find(row => row.date === currentDate.toISODate());
        return entry
            ? {day: dayOfWeek, scheduleName: entry.regularity === "no" ? `No School%%${entry.schedule_name}` : entry.schedule_name}
            : {day: dayOfWeek, scheduleName: "No School"};
    });
}
