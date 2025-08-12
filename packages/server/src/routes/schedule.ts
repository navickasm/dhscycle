import {Router} from 'express';
import {getCentralTimeDateString} from '../utils.js';
import {isCacheValid, scheduleCache} from '../cache.js';
import {fetchScheduleFromDb, fetchWeekNamesFromDb} from '../service.js';

// TODO review this logic
async function getBellScheduleForDate(dateStr: string): Promise<any> {
    const todayDateStr = getCentralTimeDateString(new Date());

    if (dateStr === todayDateStr && isCacheValid()) {
        console.log(`Serving schedule for ${dateStr} from cache.`);
        return scheduleCache.schedule!;
    }

    const scheduleJson = await fetchScheduleFromDb(dateStr);

    if (dateStr === todayDateStr) {
        scheduleCache.schedule = JSON.parse(scheduleJson || '{}');
        return scheduleCache.schedule;
    }

    return JSON.parse(scheduleJson || '{}');
}

const router = Router();

router.get('/schedule/currentDay', async (req, res) => {
    try {
        const todayDateStr = getCentralTimeDateString(new Date());
        const schedule = await getBellScheduleForDate(todayDateStr);
        return res.json(schedule);
    } catch (error) {
        console.error('Error in /schedule/currentDay:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/schedule/:date', async (req, res) => {
    try {
        const requestedDateStr = req.params.date;

        if (!requestedDateStr) {
            return res.status(400).json({ message: 'Date parameter is required in the URL (e.g., /schedule/YYYY-MM-DD).' });
        }
        const schedule = await getBellScheduleForDate(requestedDateStr);
        return res.json(schedule);
    } catch (error) {
        console.error('Error in /schedule/:date:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/thisWeek', async (req, res) => {
    try {
        const names = await fetchWeekNamesFromDb(getCentralTimeDateString(new Date()));
        console.log(names);
        return res.json(names);
    } catch (error) {
        console.error('Error in /schedule/:date:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
