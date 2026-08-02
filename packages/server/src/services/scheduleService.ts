import {DateTime} from 'luxon';
import {getDbGet} from "../database.js";
import {getCentralTimeDateString, parseScheduleData} from "../utils.js";
import {isCacheValid, scheduleCache} from "./cacheService.js";
import {FullSchedule} from "../types/schedule.js";

export async function fetchRegularSchedule(regularity: string): Promise<string | null> {
    const dbGet = getDbGet();

    try {
        const row = await dbGet(
            `SELECT schedule_json FROM regular_schedules WHERE regularity = ?;`,
            [regularity]
        );

        if (!row || !row.schedule_json) return null;

        return row.schedule_json;
    } catch (err) {
        return Promise.reject(new Error(`Error fetching regular schedule for ${regularity}: ${err}`));
    }
}

// TODO evaluate the usage of the fetchRegularSchedule method here
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
            const parsedTimes = parseScheduleData(scheduleData);
            const fullSchedule: FullSchedule = {
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

export async function getBellScheduleForDate(dateStr: string): Promise<any> {
    const todayDateStr = getCentralTimeDateString(new Date());

    if (dateStr === todayDateStr && isCacheValid("schedule")) {
        return scheduleCache.schedule!;
    }

    const scheduleJson = await fetchScheduleFromDb(dateStr);

    if (dateStr === todayDateStr) {
        scheduleCache.schedule = JSON.parse(scheduleJson || '{}');
        return scheduleCache.schedule;
    }

    return JSON.parse(scheduleJson || '{}');
}
