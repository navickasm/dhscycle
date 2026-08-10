import {DateTime} from 'luxon';
import {getDb} from "../database.js";
import {parseScheduleData} from "../utils.js";
import {CalendarCells, ScheduleType, StartTime} from "../types/calendar.js";
import {fetchRegularSchedule} from "./scheduleService.js";
import {getSettings} from "./adminService.js";
import {getCachedCalendar, setCachedCalendar} from "./cacheService.js";

interface CalendarRow {
    date: string;
    regularity: string | null;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
    special_schedule_base: string | null;
    calendar_events: string | null;
    schedule_json: string | null;
}

function getYearForMonth(month: number): number {
    try {
        const settings = getSettings();
        const start = settings['school_year_start'] ? DateTime.fromISO(settings['school_year_start']) : null;
        const end = settings['school_year_end'] ? DateTime.fromISO(settings['school_year_end']) : null;
        if (start?.isValid && end?.isValid) {
            return month >= start.month ? start.year : end.year;
        }
    } catch (error) {
        console.error('Error reading school year settings, falling back to defaults:', error);
    }
    return month >= 8 ? 2026 : 2027;
}

export function getCalendarForMonth(month: number): CalendarCells[] {
    const cached = getCachedCalendar(month);
    if (cached !== undefined) {
        return cached;
    }

    const calendar = fetchCalendarForMonthFromDb(month);
    setCachedCalendar(month, calendar);
    return calendar;
}

function fetchCalendarForMonthFromDb(month: number): CalendarCells[] {
    try {
        const year = getYearForMonth(month);
        const startDate = DateTime.fromObject({ year, month }).startOf('month').toISODate();
        const endDate = DateTime.fromObject({ year, month })
            .endOf('month')
            .set({ weekday: 5 }) // Set to Friday
            .plus({ days: DateTime.fromObject({ year, month }).endOf('month').weekday > 5 ? 7 : 0 }) // Adjust to next Friday if needed
            .toISODate();

        const rows = getDb().prepare<[string, string], CalendarRow>(`
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
        `).all(startDate!, endDate!);
        
        return rows.filter(row => row.date).map(row => {
            const isNoSchool = row.regularity === "no" || (row.regularity === 'special' && !row.schedule_json);
            return isNoSchool
                ? {
                    date: new Date(row.date).toISOString().split('T')[0],
                    isNoSchool: true,
                    noSchoolReason: row.special_schedule_name || "No School",
                }
                : {
                    date: new Date(row.date).toISOString().split('T')[0],
                    startTime: getStartTime(row),
                    scheduleType: (row.regularity === "special"
                        ? (row.special_schedule_base && row.special_schedule_base !== "none" ? row.special_schedule_base : "other")
                        : (row.regularity || "other")) as ScheduleType,
                    specialNote: row.calendar_events ?? undefined,
                    specialModifications: row.special_schedule_name ? row.special_schedule_name.split("%%").slice(1) : undefined,
                    isSpecial: row.regularity === "special",
                };
        });
    } catch (error) {
        console.error(`Error fetching calendar for month ${month}:`, error);
        return [];
    }
}

function getStartTime(row: CalendarRow): StartTime {
    const schedule = row.schedule_json
        ? parseScheduleData(row.schedule_json)
        : row.regularity && row.regularity != "special"
            ? parseScheduleData(fetchRegularSchedule(row.regularity) || "[]")
            : [];

    if (!Array.isArray(schedule)) {
        console.error("Invalid schedule data:", schedule);
        return "other";
    }

    const period1 = schedule.find((item: any) => item.period === "1") || schedule.find((item: any) => item.period === "2");
    return period1?.start === "08:20" ? "8:20" : period1?.start === "08:40" ? "8:40" : "other";
}
