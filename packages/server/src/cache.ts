import { getCentralTimeDateString } from './utils.js';
import {CalendarCells} from "./routes/calendar.js";

// TODO make more efficient, separate caches. Not a huge problem right now since it's a 3-second calc max for the first to visit the site of the day.
interface ScheduleCache {
    schedule: string | null;
    timestamp: Date | null;
}

interface CalendarCache {
    calendar: CalendarCells[] | null;
    key: number | null;
}

export const scheduleCache: ScheduleCache = (() => {
    let _schedule: string | null = null;

    return {
        get schedule() {
            return _schedule;
        },
        set schedule(value: string | null) {
            _schedule = value;
            this.timestamp = value ? new Date(Date.now()) : null;
        },
        timestamp: null
    };
})();

export const calendarCache: CalendarCache = (() => {
    let _calendar: CalendarCells[] | null = null;

    return {
        get calendar() {
            return _calendar;
        },
        set calendar(value: CalendarCells[] | null) {
            _calendar = value;
            this.key = value ? new Date(Date.now()).getUTCMonth() : null;
        },
        key: null,
        timestamp: null
    };
})();

export function isCacheValid(cacheType: "schedule" | "calendar"): boolean {
    if (cacheType === "schedule") {
        if (scheduleCache.schedule === null || scheduleCache.timestamp === null) return false;
        const currentCentralDayStr = getCentralTimeDateString(new Date());
        const cachedDateCentralDayStr = getCentralTimeDateString(scheduleCache.timestamp);
        return cachedDateCentralDayStr === currentCentralDayStr;
    } else if (cacheType === "calendar") {
        if (calendarCache.calendar === null || calendarCache.key === null) return false;
        const currentMonth = new Date().getUTCMonth();
        return calendarCache.key === currentMonth;
    }
    return false;
}

// TODO add specific cache invalidation strategies
export function invalidateCaches(): void {
    scheduleCache.schedule = null;
    scheduleCache.timestamp = null;
    calendarCache.key = null;
    calendarCache.calendar = null;
    console.log("Cache invalidated by admin request.");
}

