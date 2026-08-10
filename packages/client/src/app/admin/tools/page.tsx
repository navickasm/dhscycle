'use client';

import React, {useState} from 'react';
import {adminFetch} from '../adminApi.ts';

const inputStyle: React.CSSProperties = {
    padding: '0.25rem 0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    font: 'inherit',
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    fontSize: '0.85rem',
    color: '#444',
};

const buttonStyle: React.CSSProperties = {
    padding: '0.4rem 1.2rem',
    font: 'inherit',
    cursor: 'pointer',
    backgroundColor: '#1155cc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
};

const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
};

function weekdaysBetween(start: string, end: string): string[] {
    const dates: string[] = [];
    const d = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);
    while (d <= last) {
        const day = d.getUTCDay();
        if (day !== 0 && day !== 6) {
            dates.push(d.toISOString().slice(0, 10));
        }
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return dates;
}

function BreakWizard() {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const valid = start && end && name.trim() && start <= end;

    const run = async () => {
        if (!valid) return;
        const dates = weekdaysBetween(start, end);
        if (!window.confirm(`Mark ${dates.length} week day(s) from ${start} to ${end} as "${name}" (no school)?`)) return;
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            for (let i = 0; i < dates.length; i++) {
                setStatus(`Saving ${i + 1}/${dates.length}…`);
                const res = await adminFetch(`/admin/day/${dates[i]}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        regularity: 'no',
                        special_schedule_name: name.trim(),
                        special_schedule_h2: null,
                        special_schedule_base: null,
                        schedule_json: null,
                        calendar_events: null,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.message ?? `Failed on ${dates[i]} (HTTP ${res.status})`);
                }
            }
            setStatus(`Done`);
        } catch (err) {
            console.error('Break wizard error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setStatus(null);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section style={sectionStyle}>
            <h2 style={{margin: 0, fontSize: '1.1rem'}}>Break Wizard</h2>
            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                <label style={labelStyle}>
                    <span style={{fontWeight: 'bold'}}>Start</span>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle}/>
                </label>
                <label style={labelStyle}>
                    <span style={{fontWeight: 'bold'}}>End</span>
                    <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle}/>
                </label>
                <label style={{...labelStyle, flex: '1 1 180px'}}>
                    <span style={{fontWeight: 'bold'}}>Break Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Winter Break"
                        style={inputStyle}
                    />
                </label>
            </div>
            <button onClick={() => void run()} disabled={busy || !valid} style={{...buttonStyle, opacity: busy || !valid ? 0.6 : 1}}>
                {busy ? 'Working…' : 'Apply'}
            </button>
            {status && <p style={{margin: 0, fontSize: '0.85rem', color: '#1a7a1a'}}>{status}</p>}
            {error && <p style={{margin: 0, fontSize: '0.85rem', color: 'red'}}>{error}</p>}
        </section>
    );
}

function PopulateTool() {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const valid = start && end && start <= end;

    const run = async () => {
        if (!valid) return;
        if (!window.confirm(`Populate schedules from ${start} to ${end}?`)) return;
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const res = await adminFetch(`/admin/populate?startDate=${start}&endDate=${end}`, {method: 'POST'});
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? `HTTP error! status: ${res.status}`);
            }
            setStatus('Database populated.');
        } catch (err) {
            console.error('Populate error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section style={sectionStyle}>
            <h2 style={{margin: 0, fontSize: '1.1rem'}}>Populate</h2>
            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                <label style={labelStyle}>
                    <span style={{fontWeight: 'bold'}}>Start</span>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle}/>
                </label>
                <label style={labelStyle}>
                    <span style={{fontWeight: 'bold'}}>End</span>
                    <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle}/>
                </label>
            </div>
            <button onClick={() => void run()} disabled={busy || !valid} style={{...buttonStyle, opacity: busy || !valid ? 0.6 : 1}}>
                {busy ? 'Populating…' : 'Populate'}
            </button>
            {status && <p style={{margin: 0, fontSize: '0.85rem', color: '#1a7a1a'}}>{status}</p>}
            {error && <p style={{margin: 0, fontSize: '0.85rem', color: 'red'}}>{error}</p>}
        </section>
    );
}

function InvalidateCachesTool() {
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = async () => {
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const res = await adminFetch('/admin/invalidateCache', {method: 'POST'});
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? `HTTP error! status: ${res.status}`);
            }
            setStatus('Ok');
        } catch (err) {
            console.error('Invalidate caches error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section style={sectionStyle}>
            <h2 style={{margin: 0, fontSize: '1.1rem'}}>Invalidate Caches</h2>
            <button onClick={() => void run()} disabled={busy} style={{...buttonStyle, backgroundColor: '#b3261e', opacity: busy ? 0.6 : 1}}>
                {busy ? 'Invalidating…' : 'Invalidate All Caches'}
            </button>
            {status && <p style={{margin: 0, fontSize: '0.85rem', color: '#1a7a1a'}}>{status}</p>}
            {error && <p style={{margin: 0, fontSize: '0.85rem', color: 'red'}}>{error}</p>}
        </section>
    );
}

export default function AdminToolsPage() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '720px'}}>
            <h1 style={{margin: 0}}>Tools</h1>
            <BreakWizard/>
            <PopulateTool/>
            <InvalidateCachesTool/>
        </div>
    );
}
