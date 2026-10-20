import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const baseDir = path.dirname(new URL(import.meta.url).pathname);
const dbPath = path.join(baseDir, '../res/schedule.db');
const migrationsDir = path.join(baseDir, '../res/migrations');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

try {
    for (const file of migrationFiles) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        try {
            db.exec(sql);
            console.log(`Ran migration: ${file}`);
        } catch (err) {
            console.error(`Failed to run migration: ${file}\n`, err);
            process.exitCode = 1;
            break;
        }
    }
} finally {
    db.close();
}
