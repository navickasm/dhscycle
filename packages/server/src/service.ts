import {DateTime} from 'luxon';
import {getDbAll, getDbGet, getDbRun} from "./database.js";

export async function fetchWeekNamesFromDb(dateStr: string): Promise<{
    scheduleName: any;
    day: string | "Invalid DateTime"
}[]> {
    const dbAll = getDbAll();

    if (!dateStr) return Promise.reject(new Error("Date string is required."));

    try {
        const weekStart = DateTime.fromISO(dateStr).plus({days: 2}).set({weekday: 1}).toISODate();
        const weekEnd = DateTime.fromISO(dateStr).plus({days: 6}).set({weekday: 5}).toISODate();

        console.log(weekStart + " " + weekEnd);
        const sql = `SELECT DISTINCT
            s.date,
            CASE
                WHEN s.regularity != 'special'
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
                ? {day: dayOfWeek, scheduleName: entry.schedule_name}
                : {day: dayOfWeek, scheduleName: "No School"};
        });
    } catch (err) {
        return Promise.reject(new Error(`Error fetching week schedule names for ${dateStr}: ${err}`));
    }
}

export async function fetchScheduleFromDb(dateStr: string): Promise<string | null> {
    const dbGet = getDbGet();

    if (!dateStr || !DateTime.fromISO(dateStr).isValid) return Promise.reject(new Error("Valid ISO date string is required."));

    try {
        const row = await dbGet(
            `SELECT
                schedule_json,
                special_schedule_name,
                special_schedule_h2
            FROM (
                SELECT
                    CASE
                        WHEN s.regularity != 'special'
                            THEN (
                                SELECT rs.schedule_json
                                FROM regular_schedules rs
                                WHERE rs.regularity = s.regularity
                            )
                        ELSE s.schedule_json
                    END AS schedule_json,
                    CASE
                        WHEN s.regularity != 'special'
                            THEN (
                                SELECT rs.name
                                FROM regular_schedules rs
                                WHERE rs.regularity = s.regularity
                            )
                        ELSE s.special_schedule_name
                    END AS special_schedule_name,
                    CASE
                        WHEN s.regularity != 'special'
                            THEN NULL
                        ELSE s.special_schedule_h2
                    END AS special_schedule_h2
                FROM schedules s
                WHERE s.date = ?
            );`,
            [dateStr]
        );

        if (!row || !row.schedule_json) return JSON.stringify({noSchool: true, reason: "NO_SCHEDULE_DATA"});

        const scheduleData: string = row.schedule_json;

        try {
            const parsedTimes = JSON.parse(scheduleData.replace(/\\"/g, '"'));
            const fullSchedule = {
                name: row.special_schedule_name,
                h2: row.special_schedule_h2 || null,
                times: parsedTimes
            }
            return JSON.stringify(fullSchedule);
        } catch (err: unknown) {
            return Promise.reject(new Error(`Invalid JSON string from DB for ${dateStr}: ${err}`));
        }
    } catch (err) {
        return Promise.reject(new Error(`Error fetching schedule for ${dateStr} from DB: ${err}`));
    }
}

export async function incrementCounter(): Promise<void> {
    const dbRun = getDbRun();
    try {
        await dbRun(`
            INSERT INTO analytics (name, value, date) 
            VALUES ('get_schedule_requests', 1, CURRENT_DATE) 
            ON CONFLICT (name, date) 
            DO UPDATE SET value = analytics.value + 1;
        `);
    } catch (error) {
        console.error('Error incrementing counter:', error);
    }
}

export async function populateDb(startDate: string, endDate: string): Promise<void> {
    try {
        const dbRun = getDbRun();

        const start = DateTime.fromISO(startDate).setZone('America/Chicago').toJSDate();
        const end = DateTime.fromISO(endDate).setZone('America/Chicago').toJSDate();

        console.log(start, end)

        for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
            const dayOfWeek = current.getDay();
            let regularity: string | null = null;
            console.log(dayOfWeek + " " + current.toISOString());
            switch (dayOfWeek) {
                case 1:
                    regularity = 'A';
                    break;
                case 2:
                    regularity = '16';
                    break;
                case 3:
                    regularity = '27';
                    break;
                case 4:
                    regularity = '38';
                    break;
                case 5:
                    regularity = '45';
                    break;
                default:
                    continue;
            }

            const dateStr = current.toISOString().split('T')[0];

            await dbRun(
                `INSERT INTO schedules (date, regularity) VALUES (?, ?) ON CONFLICT(date) DO NOTHING;`,
                [dateStr, regularity]
            );
        }
    } catch (error) {
        console.error(`Error populating db with default data from ${startDate} to ${endDate}:`, error);
    }
}
