'use client';

import {useEffect, useState} from 'react';
import {adminFetch} from '../adminApi.ts';

interface SettingDef {
    key: string;
    label: string;
    description?: string;
    type: 'date' | 'text' | 'number';
}

const SETTING_DEFS: SettingDef[] = [
    {key: 'school_year_start', label: 'School Year Start', description: 'First day of the school year (used to determine calendar years).', type: 'date'},
    {key: 'school_year_end', label: 'School Year End', description: 'Last day of the school year.', type: 'date'},
    {key: 'school_year_label', label: 'School Year Label', description: 'Display label for the school year, e.g. 2025-2026.', type: 'text'},
    {key: 'passing_period_minutes', label: 'Passing Period (minutes)', description: 'Length of passing periods between classes.', type: 'number'},
];

export default function AdminSettingsPage() {
    const [values, setValues] = useState<Record<string, string>>({});
    const [extraSettings, setExtraSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await adminFetch('/admin/settings');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data: Record<string, string | null> = await res.json();

                const known: Record<string, string> = {};
                const extra: Record<string, string> = {};
                for (const [key, value] of Object.entries(data)) {
                    if (SETTING_DEFS.some(def => def.key === key)) {
                        known[key] = value ?? '';
                    } else {
                        extra[key] = value ?? '';
                    }
                }
                setValues(known);
                setExtraSettings(extra);
            } catch (err) {
                console.error('Error loading settings:', err);
                setError('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSavedMessage(null);
        try {
            const res = await adminFetch('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            setSavedMessage('Settings saved.');
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p style={{textAlign: 'center', padding: '2rem'}}>Loading settings…</p>;
    }

    return (
        <div style={{maxWidth: '640px', margin: '0 auto'}}>
            <h1>Settings</h1>

            {error && <p style={{color: 'red'}}>{error}</p>}

            <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {SETTING_DEFS.map(def => (
                    <label key={def.key} style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        <span style={{fontWeight: 'bold'}}>{def.label}</span>
                        {def.description && <span style={{fontSize: '0.85rem', color: '#666'}}>{def.description}</span>}
                        <input
                            type={def.type}
                            value={values[def.key] ?? ''}
                            onChange={e => setValues(v => ({...v, [def.key]: e.target.value}))}
                            style={{padding: '0.5rem', fontSize: '1rem', maxWidth: '320px'}}
                        />
                    </label>
                ))}

                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <button type="submit" disabled={saving}
                            style={{padding: '0.5rem 1.5rem', fontSize: '1rem', cursor: 'pointer'}}>
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                    {savedMessage && <span style={{color: 'green'}}>{savedMessage}</span>}
                </div>
            </form>

            {Object.keys(extraSettings).length > 0 && (
                <div style={{marginTop: '2rem'}}>
                    <h2>Other Settings</h2>
                    <table style={{borderCollapse: 'collapse'}}>
                        <tbody>
                        {Object.entries(extraSettings).map(([key, value]) => (
                            <tr key={key}>
                                <td style={{padding: '0.25rem 1rem 0.25rem 0', fontWeight: 'bold'}}>{key}</td>
                                <td style={{padding: '0.25rem 0'}}>{value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
