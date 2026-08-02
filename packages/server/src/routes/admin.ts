import { Router } from 'express';
import dotenv from 'dotenv';
import {DateTime} from 'luxon';
import {populateDb} from '../services/populateService.js';
import {invalidateCaches} from "../services/cacheService.js";
import {adminAuth} from "../middleware/adminAuth.js";
import {isValidISODate} from "../utils.js";

const router = Router();

dotenv.config();

router.post('/admin/populate', adminAuth, async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!isValidISODate(startDate)) {
        return res.status(400).json({ message: 'Malformed Request: startDate must be a valid ISO date (YYYY-MM-DD)' });
    }
    if (!isValidISODate(endDate)) {
        return res.status(400).json({ message: 'Malformed Request: endDate must be a valid ISO date (YYYY-MM-DD)' });
    }
    if (DateTime.fromISO(startDate) > DateTime.fromISO(endDate)) {
        return res.status(400).json({ message: 'Malformed Request: startDate must be before or equal to endDate' });
    }

    await populateDb(startDate, endDate).then(() => {
        res.status(200).json({ message: 'Database populated successfully.' });
    }).catch(error => {
        console.error('Error populating database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});

router.post('/admin/invalidateCache', adminAuth, (req, res) => {
    invalidateCaches();
    res.status(200).json({ message: 'Caches invalidated successfully.' });
});

router.get('/admin/test', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(204).set('status', 'invalid').send();
    }
    res.status(204).set('status', 'valid').send();
});


export default router;
