import {CalendarCells} from "./calendar.js";

export interface ScheduleCache {
    schedule: string | null;
    timestamp: Date | null;
}

export interface CalendarCache {
    calendar: CalendarCells[] | null;
    key: number | null;
}
