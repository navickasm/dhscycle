import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import {readFile} from "fs/promises";

const dbPath = path.join(import.meta.dirname, '../res/schedule.db');
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
}
const db = new sqlite3.Database(await readFile(dbPath, "utf-8"));

const migrationsDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../res/migrations');

const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

migrationFiles.forEach(file => {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(sql, (err) => {
        if (err) {
            console.error(`Failed to run migration: ${file}\n`, err);
        } else {
            console.log(`Ran migration: ${file}`);
        }
    });
});

process.on('SIGINT', () => {
    db.close(() => {
        process.exit(0);
    });
});