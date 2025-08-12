import sqlite3, { Database } from 'sqlite3';
import path from 'path';
import fs from "fs";

const dbPath = path.join(import.meta.dirname, '../res/schedule.db');
if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at: ${dbPath}. Please ensure it exists.`);
    process.exit(1);
}

let dbInstance: Database | null = null;

function promisifyDbMethod(db: Database, methodName: string): (...args: any[]) => Promise<any> {
    return function (...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            (db as any)[methodName](...args, function (this: sqlite3.RunResult, err: Error | null, result: any) {
                // console.log(`Executing ${methodName} with SQL:`, args[0], 'and params:', args[1] || []);
                if (err) {
                    reject(err);
                } else {
                    if (methodName === 'run' || methodName === 'exec') {
                        resolve({ lastID: this.lastID, changes: this.changes });
                    } else {
                        resolve(result);
                    }
                }
            });
        });
    };
}

let dbGet: ((sql: string, params?: any[]) => Promise<any>) | null = null;
let dbAll: ((sql: string, params?: any[]) => Promise<any[]>) | null = null;
let dbRun: ((sql: string, params?: any[]) => Promise<{ lastID: number, changes: number }>) | null = null;
let dbExec: ((sql: string) => Promise<{ lastID: number, changes: number }>) | null = null;

export async function initializeDatabase(): Promise<Database> {
    if (dbInstance) {
        console.log('Database already initialized, returning existing instance.');
        return dbInstance;
    }

    return new Promise((resolve, reject) => {
        dbInstance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                dbInstance = null;
                return reject(err);
            }
            console.log('Connected to the SQLite database.');

            dbGet = promisifyDbMethod(dbInstance!, 'get');
            dbAll = promisifyDbMethod(dbInstance!, 'all');
            dbRun = promisifyDbMethod(dbInstance!, 'run');
            dbExec = promisifyDbMethod(dbInstance!, 'exec');

            resolve(dbInstance!);
        });
    });
}

export function getDb(): Database {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Call initializeDatabase() first.');
    }
    return dbInstance;
}

export function getDbGet(): (sql: string, params?: any[]) => Promise<any> {
    if (!dbGet) {
        throw new Error('Database methods not initialized. Call initializeDatabase() first.');
    }
    return dbGet;
}

export function getDbAll(): (sql: string, params?: any[]) => Promise<any[]> {
    if (!dbAll) {
        throw new Error('Database methods not initialized. Call initializeDatabase() first.');
    }
    return dbAll;
}

export function getDbRun(): (sql: string, params?: any[]) => Promise<{ lastID: number, changes: number }> {
    if (!dbRun) {
        throw new Error('Database methods not initialized. Call initializeDatabase() first.');
    }
    return dbRun;
}

export function getDbExec(): (sql: string) => Promise<{ lastID: number, changes: number }> {
    if (!dbExec) {
        throw new Error('Database methods not initialized. Call initializeDatabase() first.');
    }
    return dbExec;
}

export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        return new Promise((resolve, reject) => {
            dbInstance!.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    return reject(err);
                }
                console.log('Database connection closed.');
                dbInstance = null;
                dbGet = null;
                dbAll = null;
                dbRun = null;
                dbExec = null;
                resolve();
            });
        });
    }
}