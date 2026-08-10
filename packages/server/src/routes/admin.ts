import { Router } from 'express';
import Express from 'express';
import dotenv from 'dotenv';
import {DateTime} from 'luxon';
import {populateDb} from '../services/populateService.js';
import {invalidateCaches} from "../services/cacheService.js";
import {adminAuth} from "../middleware/adminAuth.js";
import {isValidISODate} from "../utils.js";
import * as adminService from "../services/adminService.js";

const router = Router();

dotenv.config();

router.use('/admin', Express.json());
router.use('/admin', adminAuth);

router.get('/admin/verify', (req, res) => {
    // adminAuth already validated the key
    res.status(200).json({ message: 'OK' });
});

router.post('/admin/populate', (req, res) => {
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

    try {
        populateDb(startDate, endDate);
        invalidateCaches();
        res.status(200).json({ message: 'Database populated successfully.' });
    } catch (error) {
        console.error('Error populating database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/admin/invalidateCache', (req, res) => {
    invalidateCaches();
    res.status(200).json({ message: 'Caches invalidated successfully.' });
});

router.get('/admin/range', (req, res) => {
    const { start, end } = req.query;
    if (!isValidISODate(start) || !isValidISODate(end)) {
        return res.status(400).json({ message: 'Malformed Request: start and end must be valid ISO dates (YYYY-MM-DD)' });
    }
    if (DateTime.fromISO(start) > DateTime.fromISO(end)) {
        return res.status(400).json({ message: 'Malformed Request: start must be before or equal to end' });
    }
    try {
        res.status(200).json(adminService.getRange(start, end));
    } catch (error) {
        console.error('Error fetching range:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/admin/day/:date', (req, res) => {
    if (!isValidISODate(req.params.date)) {
        return res.status(400).json({ message: 'Malformed Request: date must be a valid ISO date (YYYY-MM-DD)' });
    }
    try {
        const row = adminService.getDay(req.params.date);
        if (!row) {
            return res.status(404).json({ message: 'No schedule row for that date' });
        }
        res.status(200).json(row);
    } catch (error) {
        console.error('Error fetching day:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/admin/day/:date', (req, res) => {
    if (!isValidISODate(req.params.date)) {
        return res.status(400).json({ message: 'Malformed Request: date must be a valid ISO date (YYYY-MM-DD)' });
    }
    if (!req.body || typeof req.body.regularity !== 'string') {
        return res.status(400).json({ message: 'Malformed Request: body must include regularity' });
    }
    try {
        const row = adminService.upsertDay(req.params.date, req.body);
        invalidateCaches();
        res.status(200).json(row);
    } catch (error) {
        console.error('Error upserting day:', error);
        // Most likely a CHECK constraint violation from invalid field combos
        res.status(400).json({ message: `Failed to save day: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
});

router.delete('/admin/day/:date', (req, res) => {
    if (!isValidISODate(req.params.date)) {
        return res.status(400).json({ message: 'Malformed Request: date must be a valid ISO date (YYYY-MM-DD)' });
    }
    try {
        const deleted = adminService.deleteDay(req.params.date);
        if (!deleted) {
            return res.status(404).json({ message: 'No schedule row for that date' });
        }
        invalidateCaches();
        res.status(200).json({ message: 'Day deleted successfully.' });
    } catch (error) {
        console.error('Error deleting day:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/admin/specialDays', (req, res) => {
    try {
        res.status(200).json(adminService.listSpecialDays());
    } catch (error) {
        console.error('Error listing special days:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/admin/templates', (req, res) => {
    try {
        res.status(200).json(adminService.listTemplates());
    } catch (error) {
        console.error('Error listing templates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/admin/templates', (req, res) => {
    if (!req.body || typeof req.body.name !== 'string' || typeof req.body.schedule_json !== 'string') {
        return res.status(400).json({ message: 'Malformed Request: body must include name and schedule_json' });
    }
    try {
        res.status(201).json(adminService.createTemplate(req.body));
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(400).json({ message: `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
});

router.put('/admin/templates/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Malformed Request: id must be a number' });
    }
    if (!req.body || typeof req.body.name !== 'string' || typeof req.body.schedule_json !== 'string') {
        return res.status(400).json({ message: 'Malformed Request: body must include name and schedule_json' });
    }
    try {
        const row = adminService.updateTemplate(id, req.body);
        if (!row) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json(row);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(400).json({ message: `Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
});

router.delete('/admin/templates/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Malformed Request: id must be a number' });
    }
    try {
        const deleted = adminService.deleteTemplate(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json({ message: 'Template deleted successfully.' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/admin/regularSchedules', (req, res) => {
    try {
        res.status(200).json(adminService.listRegularSchedules());
    } catch (error) {
        console.error('Error listing regular schedules:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/admin/regularSchedules/:regularity', (req, res) => {
    const { regularity } = req.params;
    if (!['A', '16', '27', '38', '45'].includes(regularity)) {
        return res.status(400).json({ message: 'Malformed Request: regularity must be one of A, 16, 27, 38, 45' });
    }
    if (!req.body || typeof req.body.schedule_json !== 'string') {
        return res.status(400).json({ message: 'Malformed Request: body must include schedule_json' });
    }
    try {
        const updated = adminService.updateRegularSchedule(regularity, req.body.name ?? null, req.body.schedule_json);
        if (!updated) {
            return res.status(404).json({ message: 'Regular schedule not found' });
        }
        invalidateCaches();
        res.status(200).json({ message: 'Regular schedule updated successfully.' });
    } catch (error) {
        console.error('Error updating regular schedule:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
