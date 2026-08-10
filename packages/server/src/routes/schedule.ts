import {Router} from 'express';
import {getCentralTimeDateString, isValidISODate} from '../utils.js';
import {getBellScheduleForDate} from '../services/scheduleService.js';
import {getWeekNames} from '../services/weekService.js';
import {incrementCounter} from '../services/analyticsService.js';

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
        if (!isValidISODate(req.params.date)) {
            return res.status(400).json({ message: 'Date parameter is required in the URL (e.g., /schedule/YYYY-MM-DD).' });
        }

        await incrementCounter();

        const schedule = await getBellScheduleForDate(req.params.date);
        return res.json(schedule);
    } catch (error) {
        console.error('Error in /schedule/:date:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/thisWeek', async (req, res) => {
    try {
        const names = getWeekNames(getCentralTimeDateString(new Date()));
        return res.json(names);
    } catch (error) {
        console.error('Error in /thisWeek:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/thisWeek/:date', async (req, res) => {
    try {
        if (!isValidISODate(req.params.date)) {
            return res.status(400).json({ message: 'Date parameter is required in the URL (e.g., /thisWeek/YYYY-MM-DD).' });
        }

        const names = getWeekNames(req.params.date);
        return res.json(names);
    } catch (error) {
        console.error('Error in /thisWeek/:date:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
