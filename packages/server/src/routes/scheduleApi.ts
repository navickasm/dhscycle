import { Router } from 'express';
import {getDbGet} from "@/database.js";

interface ScheduleCache {
    schedule: string | null;
    timestamp: Date | null;
}

const scheduleCache: ScheduleCache = {
    schedule: null,
    timestamp: null
};

function getCentralTimeDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Chicago'
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    let year = '';
    let month = '';
    let day = '';
    for (const part of parts) {
        if (part.type === 'year') year = part.value;
        if (part.type === 'month') month = part.value;
        if (part.type === 'day') day = part.value;
    }
    return `${year}-${month}-${day}`;
}

function isCacheValid(): boolean {
    if (scheduleCache.schedule === null || scheduleCache.timestamp === null) return false;
    const currentCentralDayStr = getCentralTimeDateString(new Date());
    const cachedDateCentralDayStr = getCentralTimeDateString(scheduleCache.timestamp);
    return cachedDateCentralDayStr === currentCentralDayStr;
}

function invalidateCache(): void {
    scheduleCache.schedule = null;
    scheduleCache.timestamp = null;
    console.log("Cache invalidated by admin request.");
}

async function fetchScheduleFromDb(dateStr: string): Promise<string | null> {
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

async function getBellScheduleForDate(dateStr: string, useCacheForCurrentDay: boolean = false): Promise<string> {
    const todayDateStr = getCentralTimeDateString(new Date());

    if (useCacheForCurrentDay && dateStr === todayDateStr) {
        if (isCacheValid()) {
            console.log(`Serving schedule for ${dateStr} from cache.`);
            return scheduleCache.schedule!;
        } else {
            console.log(`Cache invalid or expired for ${dateStr}. Fetching new schedule for current day.`);
            const scheduleJson = await fetchScheduleFromDb(dateStr);

            if (scheduleJson) {
                scheduleCache.schedule = scheduleJson;
                scheduleCache.timestamp = new Date();
                console.log(`Cache updated with schedule JSON string for ${dateStr}.`);
            } else {
                console.log(`No schedule found for ${dateStr} in the database. Caching empty JSON array for current day.`);
                scheduleCache.schedule = '[]';
                scheduleCache.timestamp = new Date();
            }

            return scheduleCache.schedule!;
        }
    } else {
        console.log(`Fetching schedule for ${dateStr} directly from DB (not current day or cache bypassed).`);
        const scheduleJson = await fetchScheduleFromDb(dateStr);
        return scheduleJson || '[]';
    }
}

const router = Router();

router.get('/schedule/currentDay', async (req, res) => {
    try {
        const todayDateStr = getCentralTimeDateString(new Date());
        const scheduleJsonString = await getBellScheduleForDate(todayDateStr, true);
        const scheduleObject = JSON.parse(scheduleJsonString);
        return res.json(scheduleObject);
    } catch (error) {
        console.error('Error in /api/schedule/currentDay:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/schedule', async (req, res) => {
    try {
        const requestedDateStr = req.query.date as string;

        if (!requestedDateStr) {
            return res.status(400).json({ message: 'Date query parameter is required (e.g., ?date=YYYY-MM-DD).' });
        }
        const scheduleJsonString = await getBellScheduleForDate(requestedDateStr, false);
        const scheduleObject = JSON.parse(scheduleJsonString);
        return res.json(scheduleObject);
    } catch (error) {
        console.error('Error in /api/schedule:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
