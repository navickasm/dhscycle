import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(import.meta.dirname, '../res/schedule.db');

let dbInstance: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
    if (dbInstance) {
        return dbInstance;
    }

    if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found at: ${dbPath}. Please run migrations first (npm run migrate).`);
    }

    dbInstance = new Database(dbPath, { fileMustExist: true });

    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    console.log('Connected to the SQLite database.');
    return dbInstance;
}

export function getDb(): Database.Database {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Call initializeDatabase() first.');
    }
    return dbInstance;
}

export function closeDatabase(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
        console.log('Database connection closed.');
    }
}
