#!/usr/bin/env node

import Express from 'express';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import {corsMiddleware} from './middleware/cors.js';
import {closeDatabase, initializeDatabase} from "./database.js";

dotenv.config();

initializeDatabase();

const app = Express();

app.use(corsMiddleware);
app.use(routes);

app.listen(4000, () => {
    console.log("API Server online");
});

process.on('SIGINT', () => {
    closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    closeDatabase();
    process.exit(0);
});
