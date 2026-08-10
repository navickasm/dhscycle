#!/usr/bin/env node

import Express from 'express';
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

app.listen(4000, () => {
    console.log("API Server online");
});

function handleShutdown(signal: string) {
    closeDatabase();
    process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
