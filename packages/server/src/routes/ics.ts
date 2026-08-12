import {Router} from 'express';
import {getIcsFeed, IcsOptions} from '../services/icsService.js';

const router = Router();

function parseIcsOptions(query: Record<string, unknown>): IcsOptions | null {
    const options: IcsOptions = {};

    if (query.lunch !== undefined) {
        if (!['1', '2', '3'].includes(String(query.lunch))) return null;
        options.lunch = parseInt(String(query.lunch), 10) as 1 | 2 | 3;
    }

    if (query.friLunch !== undefined) {
        const friLunch = String(query.friLunch).toUpperCase();
        if (!['A', 'B', 'C'].includes(friLunch)) return null;
        options.friLunch = friLunch as 'A' | 'B' | 'C';

        if (friLunch === 'A') {
            const fri6 = String(query.fri6 ?? 'A').toUpperCase();
            if (!['A', 'B'].includes(fri6)) return null;
            options.fri6 = fri6 as 'A' | 'B';
        }
    }

    if (query.eb !== undefined) {
        const eb = String(query.eb).toLowerCase();
        if (!['0', '1', 'true', 'false'].includes(eb)) return null;
        options.eb = eb === '1' || eb === 'true';
    }

    if (query.sc !== undefined) {
        const sc = String(query.sc).toLowerCase();
        if (!['0', '1', 'true', 'false'].includes(sc)) return null;
        options.sc = sc === '1' || sc === 'true';
    }

    return options;
}

router.get('/calendar.ics', (req, res) => {
    try {
        const options = parseIcsOptions(req.query as Record<string, unknown>);
        if (options === null) {
            return res.status(400).json({ message: 'Malformed Request: lunch must be 1-3, friLunch must be A-C, fri6 must be A or B, eb and sc must be 0/1' });
        }

        const feed = getIcsFeed(options);
        res.set({
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="dhscycle.ics"',
            'Cache-Control': 'public, max-age=3600',
        });
        return res.send(feed);
    } catch (error) {
        console.error('Error serving ICS feed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
