import { DateTime } from 'luxon';
import {getDbExec, getDbGet, getDbRun} from "./database.js";

export async function fetchScheduleFromDb(dateStr: string): Promise<string | null> {
    try {
        const dbGet = getDbGet();
        const row = await dbGet(
            `SELECT
                CASE
                    WHEN s.regularity != 'special'
                    THEN (
                        SELECT rs.schedule_json
                        FROM regular_schedules rs
                        WHERE rs.regularity = s.regularity
                    )
                    END AS schedule_json
            FROM schedules s
            WHERE s.date = ?;`,
            [dateStr]
        );

        if (row && row.schedule_json) {
            let scheduleData = row.schedule_json;

            if (typeof scheduleData === 'string') {
                try {
                    const unescapedString = scheduleData.replace(/\\"/g, '"');
                    const parsed = JSON.parse(unescapedString);
                    return JSON.stringify(parsed);
                } catch (secondParseError) {
                    console.error(`Invalid JSON string from DB for ${dateStr}`, scheduleData, secondParseError);
                    return null;
                }
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching schedule for ${dateStr} from DB:`, error);
        return null;
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
