export interface ThemeVar {
    cssVar: string;
    label: string;
    defaultValue: string;
}

export const THEME_STORAGE_KEY = 'new_theme';

export const THEME_VARS: ThemeVar[] = [
    {cssVar: '--main', label: 'Main', defaultValue: '#e98888'},
    {cssVar: '--light', label: 'Light', defaultValue: '#f9e1e1'},
    {cssVar: '--bg', label: 'Background', defaultValue: '#ffffff'},
    {cssVar: '--fg', label: 'Text', defaultValue: '#171717'},
    {cssVar: '--dhsCycleBorder', label: 'Border', defaultValue: '#e8e8e8'},
];

export type Theme = Record<string, string>;

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export function defaultTheme(): Theme {
    const theme: Theme = {};
    for (const v of THEME_VARS) theme[v.cssVar] = v.defaultValue;
    return theme;
}

export function loadTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const theme = defaultTheme();
        for (const v of THEME_VARS) {
            if (typeof parsed[v.cssVar] === 'string' && HEX_REGEX.test(parsed[v.cssVar])) {
                theme[v.cssVar] = parsed[v.cssVar].toLowerCase();
            }
        }
        return theme;
    } catch {
        return null;
    }
}

export function saveTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}

export function clearSavedTheme(): void {
    localStorage.removeItem(THEME_STORAGE_KEY);
}

export function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    for (const v of THEME_VARS) {
        root.style.setProperty(v.cssVar, theme[v.cssVar] ?? v.defaultValue);
    }
}

export function resetAppliedTheme(): void {
    const root = document.documentElement;
    for (const v of THEME_VARS) {
        root.style.removeProperty(v.cssVar);
    }
}

export function encodeTheme(theme: Theme): string {
    let bytes = '';
    for (const v of THEME_VARS) {
        const hex = (theme[v.cssVar] ?? v.defaultValue).replace('#', '');
        for (let i = 0; i < 6; i += 2) {
            bytes += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
        }
    }
    return btoa(bytes);
}

export function decodeTheme(code: string): Theme | null {
    let bytes: string;
    try {
        bytes = atob(code.trim());
    } catch {
        return null;
    }
    if (bytes.length !== THEME_VARS.length * 3) return null;
    const theme: Theme = {};
    for (let i = 0; i < THEME_VARS.length; i++) {
        let hex = '#';
        for (let j = 0; j < 3; j++) {
            hex += bytes.charCodeAt(i * 3 + j).toString(16).padStart(2, '0');
        }
        if (!HEX_REGEX.test(hex)) return null;
        theme[THEME_VARS[i].cssVar] = hex;
    }
    return theme;
}
