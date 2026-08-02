import {DateTime} from 'luxon';
import {getDbAll} from "../database.js";
import {parseScheduleData} from "../utils.js";
import {CalendarCells, StartTime} from "../types/calendar.js";
import {fetchRegularSchedule} from "./scheduleService.js";

export async function getCalendarForMonth(month: number): Promise<CalendarCells[]> {
    const dbAll = getDbAll();

    try {
        const year = month >= 8 ? 2025 : 2026;
        const startDate = DateTime.fromObject({ year, month }).startOf('month').toISODate();
        const endDate = DateTime.fromObject({ year, month })
            .endOf('month')
            .set({ weekday: 5 }) // Set to Friday
            .plus({ days: DateTime.fromObject({ year, month }).endOf('month').weekday > 5 ? 7 : 0 }) // Adjust to next Friday if needed
            .toISODate();

        const sql = `
            SELECT
                s.date,
                s.regularity,
                s.special_schedule_name,
                s.special_schedule_h2,
                s.special_schedule_base,
                s.calendar_events,
                s.schedule_json
            FROM schedules s
            WHERE s.date BETWEEN ? AND ?;
        `;
        const rows = await dbAll(sql, [startDate, endDate]);

        // Map the database rows to CalendarCellProps
        return Promise.all(rows.filter((row: any) => row.date).map(async (row: any) => {
            const isNoSchool = row.regularity === "no" || (row.regularity === 'special' && !row.schedule_json);
            return isNoSchool
                ? {
                    date: new Date(row.date).toISOString().split('T')[0],
                    isNoSchool: true,
                    noSchoolReason: row.special_schedule_name || "No School",
                }
                : {
                    date: new Date(row.date).toISOString().split('T')[0],
                    startTime: await getStartTime(row),
                    scheduleType: row.regularity === "special"
                        ? (row.special_schedule_base && row.special_schedule_base !== "none" ? row.special_schedule_base : "other")
                        : (row.regularity || "other"),
                    specialNote: row.calendar_events,
                    specialModifications: row.special_schedule_name ? row.special_schedule_name.split("%%").slice(1) : undefined,
                    isSpecial: row.regularity === "special",
                };
        }));
    } catch (error) {
        console.error(`Error fetching calendar for month ${month}:`, error);
        return [];
    }
}

async function getStartTime(row: any): Promise<StartTime> {
    const schedule = row.schedule_json
        ? parseScheduleData(row.schedule_json)
        : row.regularity && row.regularity != "special"
            ? parseScheduleData(await fetchRegularSchedule(row.regularity) || "[]")
            : [];

    if (!Array.isArray(schedule)) {
        console.error("Invalid schedule data:", schedule);
        return "other";
    }

    const period1 = schedule.find((item: any) => item.period === "1") || schedule.find((item: any) => item.period === "2");
    return period1?.start === "08:20" ? "8:20" : period1?.start === "08:40" ? "8:40" : "other";
}
