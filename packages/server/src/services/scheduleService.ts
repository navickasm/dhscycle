import {DateTime} from 'luxon';
import {getDb} from "../database.js";
import {getCentralTimeDateString, parseScheduleData} from "../utils.js";
import {isCacheValid, scheduleCache} from "./cacheService.js";
import {FullSchedule} from "../types/schedule.js";

interface RegularScheduleRow {
    schedule_json: string | null;
}

interface ScheduleRow {
    schedule_json: string | null;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
}

export function fetchRegularSchedule(regularity: string): string | null {
    const row = getDb().prepare<[string], RegularScheduleRow>(
        `SELECT schedule_json FROM regular_schedules WHERE regularity = ?;`
    ).get(regularity);

    return row?.schedule_json ?? null;
}

export function fetchScheduleFromDb(dateStr: string): string {
    if (!dateStr || !DateTime.fromISO(dateStr).isValid) {
        throw new Error("Valid ISO date string is required.");
    }

    const row = getDb().prepare<[string], ScheduleRow>(
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
        );`
    ).get(dateStr);

    if (!row || !row.schedule_json) return JSON.stringify({noSchool: true, reason: "NO_SCHEDULE_DATA"});

    try {
        const parsedTimes = parseScheduleData(row.schedule_json);
        const fullSchedule: FullSchedule = {
            name: row.special_schedule_name,
            h2: row.special_schedule_h2 || null,
            times: parsedTimes
        };
        return JSON.stringify(fullSchedule);
    } catch (err: unknown) {
        throw new Error(`Invalid JSON string from DB for ${dateStr}: ${err}`);
    }
}

export function getBellScheduleForDate(dateStr: string): any {
    const todayDateStr = getCentralTimeDateString(new Date());

    if (dateStr === todayDateStr && isCacheValid("schedule")) {
        return scheduleCache.schedule!;
    }

    const scheduleJson = fetchScheduleFromDb(dateStr);

    if (dateStr === todayDateStr) {
        scheduleCache.schedule = JSON.parse(scheduleJson || '{}');
        return scheduleCache.schedule;
    }

    return JSON.parse(scheduleJson || '{}');
}
