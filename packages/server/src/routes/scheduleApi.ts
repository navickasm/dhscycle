import { Router } from 'express';
import { getCentralTimeDateString } from '@/lib/utils.js';
import { scheduleCache, isCacheValid } from '@/cache.js';
import { fetchScheduleFromDb } from '@/service/scheduleService.js';

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
