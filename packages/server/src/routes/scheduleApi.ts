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

function isCacheValid(): boolean {
    if (scheduleCache.schedule === null || scheduleCache.timestamp === null) return false;
    const today = new Date();
    const cachedDate = new Date(scheduleCache.timestamp);
    today.setHours(0, 0, 0, 0);
    cachedDate.setHours(0, 0, 0, 0);
    return cachedDate.getTime() === today.getTime();
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
            [dateStr]);

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

async function getBellScheduleForDate(dateStr: string): Promise<string> {
    if (isCacheValid()) {
        const cachedDate = scheduleCache.timestamp!.toISOString().split('T')[0];
        if (cachedDate === dateStr) {
            console.log(`Serving schedule for ${dateStr} from cache.`);
            return scheduleCache.schedule!;
        }
    }

    console.log(`Cache invalid or expired for ${dateStr}. Fetching new schedule.`);
    const scheduleJson = await fetchScheduleFromDb(dateStr);

    if (scheduleJson) {
        scheduleCache.schedule = scheduleJson;
        scheduleCache.timestamp = new Date();
        console.log(`Cache updated with schedule JSON string for ${dateStr}.`);
    } else {
        console.log(`No schedule found for ${dateStr} in the database. Caching empty JSON array.`);
        scheduleCache.schedule = '[]';
        scheduleCache.timestamp = new Date();
    }

    return scheduleCache.schedule!;
}

const router = Router();

router.get('/currentDay', async (req, res) => {
    try {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const scheduleJsonString = await getBellScheduleForDate(todayDateStr);
        const scheduleObject = JSON.parse(scheduleJsonString);
        return res.json(scheduleObject);
    } catch (error) {
        console.error('Error in /api/schedule:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
