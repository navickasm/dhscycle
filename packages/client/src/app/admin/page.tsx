'use client';

import {useCallback, useEffect, useState} from 'react';
import Calendar from '../../components/calendar/Calendar.tsx';
import {CalendarCellData} from '../../components/calendar/CalendarCell.tsx';
import {adminFetch, API_BASE} from './adminApi.ts';
import ScheduleEditorPopup from './ScheduleEditorPopup.tsx';

interface YearMonth {
    year: number;
    month: number;
}

function ymKey(ym: YearMonth): string {
    return `${ym.year}-${String(ym.month).padStart(2, '0')}`;
}

function ymLabel(ym: YearMonth): string {
    return new Date(Date.UTC(ym.year, ym.month - 1, 1))
        .toLocaleString('en-US', {month: 'long', year: 'numeric', timeZone: 'UTC'});
}

function monthsBetween(startISO: string, endISO: string): YearMonth[] {
    const [sy, sm] = startISO.split('-').map(n => parseInt(n, 10));
    const [ey, em] = endISO.split('-').map(n => parseInt(n, 10));
    const months: YearMonth[] = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
        months.push({year: y, month: m});
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return months;
}

function weekdaysInMonth(ym: YearMonth): Date[] {
    const days: Date[] = [];
    const d = new Date(Date.UTC(ym.year, ym.month - 1, 1));
    while (d.getUTCMonth() === ym.month - 1) {
        const dow = d.getUTCDay();
        if (dow >= 1 && dow <= 5) {
            days.push(new Date(d));
        }
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return days;
}

function toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function ErrorBox({errors}: { errors: string[] }) {
    if (errors.length === 0) return null;
    return (
        <div style={{
            border: '1px solid #cc0000',
            backgroundColor: '#cc000011',
            color: '#990000',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            margin: '0 auto 1rem',
            maxWidth: '48rem',
        }}>
            <p style={{margin: 0, fontWeight: 'bold'}}>Error{errors.length > 1 ? 's' : ''}</p>
            <ul style={{margin: '0.25rem 0 0', paddingLeft: '1.25rem'}}>
                {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
        </div>
    );
}

function adminMonthRange(): YearMonth[] {
    const now = new Date();
    const startYear = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return monthsBetween(`${startYear}-08`, `${startYear + 3}-06`);
}

export default function AdminCalendarPage() {
    const [months] = useState<YearMonth[]>(adminMonthRange);
    const [monthIndex, setMonthIndex] = useState(() => {
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const idx = adminMonthRange().findIndex(ym => ymKey(ym) === currentKey);
        return idx >= 0 ? idx : 0;
    });
    const [cells, setCells] = useState<CalendarCellData[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const addError = useCallback((message: string) => {
        setErrors(prev => prev.includes(message) ? prev : [...prev, message]);
    }, []);

    const currentMonth = months[monthIndex] ?? null;

    useEffect(() => {
        if (!currentMonth) return;
        let cancelled = false;

        const fetchCalendar = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/calendar/${currentMonth.month}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data: (Omit<CalendarCellData, 'date'> & { date: string })[] = await res.json();
                if (cancelled) return;

                const byDate = new Map<string, any>(data.map(item => [item.date, item]));
                const monthPrefix = ymKey(currentMonth);

                const monthCells: CalendarCellData[] = weekdaysInMonth(currentMonth).map(date => {
                    const iso = toISODate(date);
                    const item = byDate.get(iso);
                    if (item) {
                        return {
                            ...item,
                            date,
                        } as CalendarCellData;
                    }
                    return {date, isEmpty: true};
                });

                setCells(monthCells.filter(c => toISODate(c.date).startsWith(monthPrefix)));
            } catch (err) {
                console.error('Error fetching admin calendar:', err);
                if (!cancelled) addError(`Failed to load calendar data for ${ymLabel(currentMonth)} from GET /calendar/${currentMonth.month}: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCalendar();
        return () => {
            cancelled = true;
        };
    }, [currentMonth, refreshKey, addError]);

    const handleCellClick = useCallback((date: Date) => {
        setSelectedDate(toISODate(date));
    }, []);

    return (
        <div>
            <ErrorBox errors={errors}/>

            {loading ? (
                <p style={{textAlign: 'center', padding: '2rem'}}>Loading calendar…</p>
            ) : (
                <div style={{overflowX: 'auto', width: '100%'}}>
                    <Calendar
                        cells={cells}
                        onCellClick={handleCellClick}
                        isAdmin
                        months={months}
                        monthIndex={monthIndex}
                        onMonthChange={setMonthIndex}
                        showYear
                    />
                </div>
            )}

            {selectedDate && (
                <ScheduleEditorPopup
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSaved={() => {
                        setSelectedDate(null);
                        setRefreshKey(k => k + 1);
                    }}
                />
            )}
        </div>
    );
}
