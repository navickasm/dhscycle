import {Router} from "express";
import {getCalendarForMonth} from "../services/calendarService.js";

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

        const calendarData = getCalendarForMonth(monthNumber);
        res.status(200).json(calendarData);
    } catch (error) {
        console.error('Error serving calendar:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
