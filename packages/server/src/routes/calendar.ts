import {Router} from "express";
import {getCalendarForMonth} from "../service.js";
import {calendarCache, isCacheValid, scheduleCache} from "../cache.js";

type ScheduleType = 'A' | '16' | '27' | '38' | '45' | 'other';
export type StartTime = '8:20' | '8:40' | 'other';

export type CalendarCells =
    | { // Yes school
    date: string;
    startTime: StartTime;
    specialNote?: string;
    specialModifications?: string[];
    scheduleType: ScheduleType;
    isSpecial?: boolean;
    isNoSchool?: false;
    noSchoolReason?: never;
}
    | { // No school
    date: string;
    startTime?: never;
    specialNote?: string;
    specialModifications?: string[];
    isSpecial?: never;
    scheduleType?: never;
    isNoSchool: true;
    noSchoolReason?: string;
};

const router = Router();

router.get('/calendar/:month', async (req, res) => {
    try {
        const monthNumber = parseInt(req.params.month, 10);
        if (isNaN(monthNumber)) {
            return res.status(400).json({ message: 'Malformed Request: month must be a number' });
        }

        const currentMonth = new Date().getUTCMonth() + 1;

        if (monthNumber == currentMonth && isCacheValid("calendar")) {
            console.log(`Serving calendar for month ${monthNumber} from cache.`);
            return res.status(200).json(calendarCache.calendar);
        }

        const calendarData = await getCalendarForMonth(monthNumber);

        if (monthNumber == currentMonth) {
            calendarCache.calendar = calendarData;
            return scheduleCache.schedule;
        }

        calendarCache.calendar = calendarData;
        res.status(200).json(calendarData);
    } catch (error) {
        console.error('Error serving calendar:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;