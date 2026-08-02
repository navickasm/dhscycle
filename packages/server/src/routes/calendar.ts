import {Router} from "express";
import {getCalendarForMonth} from "../services/calendarService.js";
import {calendarCache, isCacheValid} from "../services/cacheService.js";

const router = Router();

router.get('/calendar/:month', async (req, res) => {
    try {
        const monthNumber = parseInt(req.params.month, 10);
        if (isNaN(monthNumber)) {
            return res.status(400).json({ message: 'Malformed Request: month must be a number' });
        }
        if (monthNumber < 1 || monthNumber > 12) {
            return res.status(400).json({ message: 'Malformed Request: month must be between 1 and 12' });
        }

        const currentMonth = new Date().getUTCMonth() + 1;

        if (monthNumber == currentMonth && isCacheValid("calendar")) {
            return res.status(200).json(calendarCache.calendar);
        }

        const calendarData = await getCalendarForMonth(monthNumber);

        calendarCache.calendar = calendarData;
        res.status(200).json(calendarData);
    } catch (error) {
        console.error('Error serving calendar:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
