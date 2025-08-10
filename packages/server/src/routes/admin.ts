import { Router } from 'express';
import { getCentralTimeDateString } from '../utils.js';
import { scheduleCache, isCacheValid } from '../cache.js';
import {fetchScheduleFromDb, populateDb} from '../service.js';

const router = Router();

/**
 * Query parameters:
 * startDate: string (YYYY-MM-DD) - the starting date to populate
 * endDate: string (YYYY-MM-DD) - the ending date to populate
 */
router.post('/admin/populate', async (req, res) => {
    await populateDb(req.query.startDate as string, req.query.endDate as string).then(() => {
        res.status(200).json({ message: 'Database populated successfully.' });
    }).catch(error => {
        console.error('Error populating database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});

export default router;
