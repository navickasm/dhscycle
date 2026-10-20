#!/usr/bin/env node

import Express, {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import {corsMiddleware} from './middleware/cors.js';
import {closeDatabase, initializeDatabase} from "./database.js";
import {setupCacheWarming} from "./services/warmupService.js";

dotenv.config();

initializeDatabase();
setupCacheWarming();

const app = Express();

app.use(corsMiddleware);
app.use(routes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'Forbidden: Origin not allowed' });
    }

    console.error('Unhandled error:', err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(4000, () => {
    console.log("API Server online");
});

function handleShutdown(signal: string) {
    closeDatabase();
    process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
