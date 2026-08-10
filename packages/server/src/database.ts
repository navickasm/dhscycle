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
    dbInstance.pragma('busy_timeout = 5000');

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
        let cp = false;
        try {
            dbInstance.pragma('wal_checkpoint(TRUNCATE)');
            cp = true;
        } catch (error) {
            console.error('Error checkpointing WAL before close:', error);
        }

        dbInstance.close();
        dbInstance = null;

        try {
            const walPath = `${dbPath}-wal`;
            const shmPath = `${dbPath}-shm`;

            if (cp && fs.existsSync(walPath)) {
                const walStats = fs.statSync(walPath);
                if (walStats.size === 0) {
                    fs.rmSync(walPath, { force: true });
                    if (fs.existsSync(shmPath)) {
                        fs.rmSync(shmPath, { force: true });
                    }
                    console.log('Database connection closed.');
                } else {
                    console.warn('WARNING: WAL file is not empty. Skipping deletion to prevent data loss.');
                }
            }
        } catch (error) {
            console.error('Error during residual file cleanup:', error);
        }
    }
}
