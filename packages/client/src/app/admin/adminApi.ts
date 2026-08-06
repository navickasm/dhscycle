'use client';

export const API_BASE = process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://api.dhscycle.com';

const KEY_STORAGE = 'dhscycle_admin_key';

export function getAdminKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY_STORAGE);
}

export function setAdminKey(key: string): void {
    localStorage.setItem(KEY_STORAGE, key);
}

export function clearAdminKey(): void {
    localStorage.removeItem(KEY_STORAGE);
}

export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const key = getAdminKey();
    return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': key ?? '',
            ...(options.headers ?? {}),
        },
    });
}

export async function verifyKey(key: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/admin/verify`, {
            headers: { 'x-api-key': key },
        });
        return res.ok;
    } catch {
        return false;
    }
}
