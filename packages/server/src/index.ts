#!/usr/bin/env node

import Express from 'express';
import dotenv from 'dotenv';
import rateLimit from "express-rate-limit";

import scheduleRouter from './routes/schedule.js';
import adminRouter from './routes/admin.js';
import {closeDatabase, initializeDatabase} from "./database.js";

dotenv.config();

const app = Express();

initializeDatabase().then(r => {
    console.log("Database initialized successfully");
})

const limiter = rateLimit({
    windowMs: 1000 * 3,
    max: 5,
});

app.use(limiter);

app.use(scheduleRouter);
app.use(adminRouter);

// app.use((req, res) => {
//     res.status(501).send();
// });

app.listen(4000);

console.log("API Server online");

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});