import {getCentralTimeDateString} from '../utils.js';
import {CalendarCells} from "../types/calendar.js";
import {WeekDayName} from "../types/schedule.js";

const scheduleCache = new Map<string, any>();
const calendarCache = new Map<number, CalendarCells[]>();
const weekCache = new Map<string, WeekDayName[]>();

let cacheDay: string | null = null;

let warm: (() => void) | null = null;

export function registerCacheWarmer(fn: () => void): void {
    warm = fn;
}

function ensureFresh(): void {
    const today = getCentralTimeDateString(new Date());
    if (cacheDay !== today) {
        scheduleCache.clear();
        calendarCache.clear();
        weekCache.clear();
        cacheDay = today;
    }
}

export function getCachedSchedule(dateStr: string): any | undefined {
    ensureFresh();
    return scheduleCache.get(dateStr);
}

export function setCachedSchedule(dateStr: string, value: any): void {
    ensureFresh();
    scheduleCache.set(dateStr, value);
}

export function getCachedCalendar(month: number): CalendarCells[] | undefined {
    ensureFresh();
    return calendarCache.get(month);
}

export function setCachedCalendar(month: number, value: CalendarCells[]): void {
    ensureFresh();
    calendarCache.set(month, value);
}

export function getCachedWeek(weekStart: string): WeekDayName[] | undefined {
    ensureFresh();
    return weekCache.get(weekStart);
}

export function setCachedWeek(weekStart: string, value: WeekDayName[]): void {
    ensureFresh();
    weekCache.set(weekStart, value);
}

export function invalidateCaches(): void {
    scheduleCache.clear();
    calendarCache.clear();
    weekCache.clear();
    cacheDay = getCentralTimeDateString(new Date());

    if (warm) {
        try {
            warm();
        } catch (error) {
            console.error('Error warming caches after invalidation:', error);
        }
    }
}
