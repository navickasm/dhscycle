#!/usr/bin/env node

import Express from 'express';
import dotenv from 'dotenv';
import rateLimit from "express-rate-limit";
import cors from 'cors';

import scheduleRouter from './routes/schedule.js';
import adminRouter from './routes/admin.js';
import publicRouter from './routes/public.js';
import {closeDatabase, initializeDatabase} from "./database.js";

dotenv.config();

const app = Express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://www.dhscycle.com',
    'http://www.dhscycle.com',
    'https://dhscycle.com',
    'http://dhscycle.com',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
app.use(publicRouter);

// app.use((req, res) => {
//     res.status(501).send();
// });

app.listen(4000);

console.log("API Server online");

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});