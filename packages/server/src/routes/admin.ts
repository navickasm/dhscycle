import { Router } from 'express';
import dotenv from 'dotenv';
import {populateDb} from '../service.js';
import {invalidateCaches} from "../cache.js";

const router = Router();

dotenv.config();

router.post('/admin/populate', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }

    await populateDb(req.query.startDate as string, req.query.endDate as string).then(() => {
        res.status(200).json({ message: 'Database populated successfully.' });
    }).catch(error => {
        console.error('Error populating database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});

router.post('/admin/invalidateCache', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    invalidateCaches();
    res.status(200).json({ message: 'Caches invalidated successfully.' });
});

router.get('/admin/test', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    console.log(apiKey);
    console.log(process.env.ADMIN_API_KEY);
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(204).set('status', 'invalid');
    }
    res.status(204).set('status', 'valid');
});


export default router;
