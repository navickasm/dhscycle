import {readFile} from 'fs/promises';
import Express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

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

app.use(scheduleApiRouter);

app.listen(4000);

console.log("API Server online");

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});