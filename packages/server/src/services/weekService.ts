import {DateTime} from 'luxon';
import {getDbAll} from "../database.js";
import {WeekDayName} from "../types/schedule.js";

export async function fetchWeekNamesFromDb(dateStr: string): Promise<WeekDayName[]> {
    const dbAll = getDbAll();

    if (!dateStr) return Promise.reject(new Error("Date string is required."));

    try {
        const weekStart = DateTime.fromISO(dateStr).plus({days: 2}).set({weekday: 1}).toISODate();
        const weekEnd = DateTime.fromISO(dateStr).plus({days: 6}).set({weekday: 5}).toISODate();

        const sql = `SELECT DISTINCT
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
        WHERE s.date BETWEEN '${weekStart}' AND '${weekEnd}';`;

        const rows = await dbAll(sql);

        return Array.from({length: 5}, (_, i) => {
            const currentDate = DateTime.fromISO(weekStart!).plus({days: i});
            const dayOfWeek = currentDate.toFormat('cccc');
            const entry = rows.find(row => row.date === currentDate.toISODate());
            return entry
                ? {day: dayOfWeek, scheduleName: entry.regularity === "no" ? `No School%%${entry.schedule_name}` : entry.schedule_name}
                : {day: dayOfWeek, scheduleName: "No School"};
        });
    } catch (err) {
        return Promise.reject(new Error(`Error fetching week schedule names for ${dateStr}: ${err}`));
    }
}
