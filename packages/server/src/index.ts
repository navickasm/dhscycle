import {readFile} from 'fs/promises';
import Express from 'express';
import dotenv from 'dotenv';
import path from "node:path";
import sqlite3 from 'sqlite3';
import cors from 'cors';

dotenv.config();

const app = Express();
const db = new sqlite3.Database('./schedule.db');

app.use(cors({
    origin: 'https://studio.apollographql.com',
    credentials: true,
}));

app.listen(4000);

console.log("API Server online");

process.on('SIGINT', () => {
    db.close(() => {
        process.exit(0);
    });
});