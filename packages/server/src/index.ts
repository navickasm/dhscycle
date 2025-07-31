import {readFile} from 'fs/promises';
import Express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from "express-rate-limit";

import scheduleApiRouter from '@/routes/scheduleApi.js';
import {closeDatabase, initializeDatabase} from "@/database.js";

dotenv.config();

const app = Express();

initializeDatabase().then(r => {
    console.log("Database initialized successfully");
})

app.use(cors({
    origin: 'https://studio.apollographql.com',
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 1000 * 3,
    max: 5,
});

app.use(limiter);

app.use(scheduleApiRouter);

app.listen(4000);

console.log("API Server online");

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});