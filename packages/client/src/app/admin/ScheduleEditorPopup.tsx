'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {adminFetch} from './adminApi.ts';
import SpecialWizard, {WizardResult} from './SpecialWizard.tsx';
import ScheduleBlocksEditor, {parseBlocks, ScheduleBlock, validateBlocks} from './ScheduleBlocksEditor.tsx';

const REGULARITIES = ['A', '16', '27', '38', '45'] as const;
type Regularity = typeof REGULARITIES[number];
type DayType = Regularity | 'special' | 'no';

interface DayRow {
    date: string;
    regularity: string;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
    special_schedule_base: string | null;
    schedule_json: string | null;
    ref_code: number | null;
    calendar_events: string | null;
    truly_special?: number;
}

interface ScheduleEditorPopupProps {
    date: string;
    onClose: () => void;
    onSaved?: () => void;
}

function predictRegularity(date: string): Regularity {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    switch (day) {
        case 2: return '16';
        case 3: return '27';
        case 4: return '38';
        case 5: return '45';
        default: return 'A';
    }
}

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

export default function ScheduleEditorPopup({date, onClose, onSaved}: ScheduleEditorPopupProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [regularSchedules, setRegularSchedules] = useState<Record<string, ScheduleBlock[]>>({});

    const [dayType, setDayType] = useState<DayType>('A');
    const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
    const [specialName, setSpecialName] = useState('');
    const [specialH2, setSpecialH2] = useState('');
    const [specialBase, setSpecialBase] = useState<string>('none');
    const [noSchoolReason, setNoSchoolReason] = useState('');
    const [calendarEvents, setCalendarEvents] = useState('');
    const [existsInDb, setExistsInDb] = useState(false);
    const [promotedFrom, setPromotedFrom] = useState<Regularity | null>(null);
    const [trulySpecial, setTrulySpecial] = useState(false);
    const [showWizard, setShowWizard] = useState(false);

    const [dragging, setDragging] = useState(false);
    const [dirty, setDirty] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const regRes = await adminFetch('/admin/regularSchedules');
                let regMap: Record<string, ScheduleBlock[]> = {};
                if (regRes.ok) {
                    const regs: { regularity: string; schedule_json: string | null }[] = await regRes.json();
                    regMap = Object.fromEntries(regs.map(r => [r.regularity, parseBlocks(r.schedule_json)]));
                }
                if (cancelled) return;
                setRegularSchedules(regMap);

                const res = await adminFetch(`/admin/day/${date}`);
                if (cancelled) return;

                if (res.status === 404) {
                    const predicted = predictRegularity(date);
                    setExistsInDb(false);
                    setDayType(predicted);
                    setBlocks(regMap[predicted] ?? []);
                    return;
                }
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const row: DayRow = await res.json();
                if (cancelled) return;

                setExistsInDb(true);
                setCalendarEvents(row.calendar_events ?? '');
                setTrulySpecial(!!row.truly_special);

                if (row.regularity === 'no') {
                    setDayType('no');
                    setNoSchoolReason(row.special_schedule_name ?? '');
                    setBlocks([]);
                } else if (row.regularity === 'special') {
                    setDayType('special');
                    setSpecialName(row.special_schedule_name ?? '');
                    setSpecialH2(row.special_schedule_h2 ?? '');
                    setSpecialBase(row.special_schedule_base ?? 'none');
                    setBlocks(parseBlocks(row.schedule_json));
                } else {
                    setDayType(row.regularity as Regularity);
                    setBlocks(regMap[row.regularity] ?? []);
                }
            } catch (err) {
                console.error('Error loading day:', err);
                if (!cancelled) setError('Failed to load schedule data.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [date]);

    const isRegular = (REGULARITIES as readonly string[]).includes(dayType);
    const blocksEditable = dayType === 'special';

    const promoteToSpecial = useCallback((): void => {
        if (dayType !== 'special' && dayType !== 'no') {
            const prev = dayType as Regularity;
            setSpecialBase(prev);
            setPromotedFrom(prev);
            setDayType('special');
            setDirty(true);
        }
    }, [dayType]);

    const handleTypeSelect = (type: DayType) => {
        if (type === dayType) return;
        if (type === 'special') {
            setShowWizard(true);
            return;
        }
        setDayType(type);
        setDirty(true);
        setPromotedFrom(null);
        if ((REGULARITIES as readonly string[]).includes(type)) {
            setBlocks(regularSchedules[type] ?? []);
        } else if (type === 'no') {
            setBlocks([]);
        }
    };

    const handleWizardApply = (result: WizardResult) => {
        setShowWizard(false);
        setDayType('special');
        setPromotedFrom(null);
        setBlocks(result.blocks);
        setSpecialName(result.name);
        setSpecialH2(result.h2 ?? '');
        setSpecialBase(result.base);
        setDirty(true);
    };

    const handleWizardCustom = () => {
        setShowWizard(false);
        setPromotedFrom(null);
        if (isRegular) {
            setSpecialBase(dayType);
        }
        setDayType('special');
        setDirty(true);
    };

    const handleBlocksChange = (next: ScheduleBlock[]) => {
        setBlocks(next);
        setDirty(true);
    };

    const handleDialogDragOver = (e: React.DragEvent) => {
        if (!dragging) return;
        const el = dialogRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const margin = 60;
        if (e.clientY < rect.top + margin) {
            el.scrollTop -= 14;
        } else if (e.clientY > rect.bottom - margin) {
            el.scrollTop += 14;
        }
    };

    const validationError = useMemo((): string | null => {
        if (dayType !== 'special') return null;
        return validateBlocks(blocks);
    }, [dayType, blocks]);

    const handleSave = async (): Promise<boolean> => {
        if (validationError) return false;
        setSaving(true);
        setError(null);
        try {
            let body: Record<string, unknown>;
            if (dayType === 'no') {
                body = {
                    regularity: 'no',
                    special_schedule_name: noSchoolReason || null,
                    special_schedule_h2: null,
                    special_schedule_base: null,
                    schedule_json: null,
                    calendar_events: calendarEvents || null,
                };
            } else if (dayType === 'special') {
                body = {
                    regularity: 'special',
                    special_schedule_name: specialName || null,
                    special_schedule_h2: specialH2 || null,
                    special_schedule_base: specialBase === 'none' ? null : specialBase,
                    schedule_json: JSON.stringify(blocks),
                    calendar_events: calendarEvents || null,
                    truly_special: trulySpecial,
                };
            } else {
                body = {
                    regularity: dayType,
                    special_schedule_name: null,
                    special_schedule_h2: null,
                    special_schedule_base: null,
                    schedule_json: null,
                    calendar_events: calendarEvents || null,
                };
            }

            const res = await adminFetch(`/admin/day/${date}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? `HTTP error! status: ${res.status}`);
            }
            setDirty(false);
            onSaved?.();
            return true;
        } catch (err) {
            console.error('Error saving day:', err);
            setError(err instanceof Error ? err.message : 'Failed to save.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleClose = async (forceSave = false) => {
        if (showWizard) {
            setShowWizard(false);
            return;
        }
        if ((dirty || forceSave) && !saving && !validationError) {
            const ok = await handleSave();
            if (!ok) return;
        }
        onClose();
    };
    const handleCloseRef = useRef(handleClose);
    handleCloseRef.current = handleClose;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                void handleCloseRef.current();
            } else if (e.key === 'Enter') {
                const tag = (e.target as HTMLElement | null)?.tagName;
                if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return;
                e.preventDefault();
                void handleCloseRef.current(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSaveTemplate = async () => {
        const defaultName = specialName || 'New Template';
        const name = window.prompt('Template name:', defaultName);
        if (!name) return;
        try {
            const res = await adminFetch('/admin/templates', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    base: specialBase === 'none' ? null : specialBase,
                    schedule_json: JSON.stringify(blocks),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? `HTTP error! status: ${res.status}`);
            }
        } catch (err) {
            console.error('Error saving template:', err);
            setError(err instanceof Error ? err.message : 'Failed to save template.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete all schedule data for ${date}? This cannot be undone.`)) return;
        setSaving(true);
        setError(null);
        try {
            const res = await adminFetch(`/admin/day/${date}`, {method: 'DELETE'});
            if (!res.ok && res.status !== 404) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            onSaved?.();
        } catch (err) {
            console.error('Error deleting day:', err);
            setError('Failed to delete.');
        } finally {
            setSaving(false);
        }
    };

    const displayDate = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });

    const typeButton = (type: DayType, label: string) => (
        <button
            key={type}
            onClick={() => handleTypeSelect(type)}
            style={{
                padding: '0.35rem 0.8rem',
                font: 'inherit',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor: dayType === type ? '#1155cc' : '#f5f5f5',
                color: dayType === type ? '#ffffff' : '#333',
                fontWeight: dayType === type ? 'bold' : 'normal',
            }}
        >
            {label}
        </button>
    );

    return (
        <div
            onClick={() => void handleClose()}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                ref={dialogRef}
                onClick={e => e.stopPropagation()}
                onDragOver={handleDialogDragOver}
                role="dialog"
                aria-modal="true"
                aria-label={`Edit schedule for ${displayDate}`}
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    width: 'min(620px, calc(100vw - 2rem))',
                    maxHeight: 'calc(100vh - 4rem)',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
                    <h2 style={{margin: 0, fontSize: '1.25rem'}}>{displayDate}</h2>
                    <button
                        onClick={() => void handleClose()}
                        aria-label="Close"
                        style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: '0.25rem',
                            color: '#666',
                        }}
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <p style={{textAlign: 'center', padding: '2rem'}}>Loading schedule…</p>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.75rem'}}>
                        <div style={{display: 'flex', gap: '0.4rem', flexWrap: 'wrap'}}>
                            {REGULARITIES.map(r => typeButton(r, r))}
                            {typeButton('special', 'Special')}
                            {typeButton('no', 'No School')}
                        </div>

                        {promotedFrom && dayType === 'special' && (
                            <p style={{
                                margin: 0,
                                padding: '0.4rem 0.6rem',
                                backgroundColor: '#fff8e1',
                                border: '1px solid #e6c200',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                            }}>
                                Editing converted this day to a <strong>Special</strong> schedule (base: {promotedFrom}).
                            </p>
                        )}

                        {dayType === 'no' && (
                            <label style={labelStyle}>
                                <span style={{fontWeight: 'bold'}}>No School Reason</span>
                                <input
                                    type="text"
                                    value={noSchoolReason}
                                    onChange={e => {
                                        setNoSchoolReason(e.target.value);
                                        setDirty(true);
                                    }}
                                    placeholder="e.g. Labor Day"
                                    style={inputStyle}
                                />
                            </label>
                        )}

                        {dayType === 'special' && (
                            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                                <label style={{...labelStyle, flex: '2 1 200px'}}>
                                    <span style={{fontWeight: 'bold'}}>Special Name</span>
                                    <input
                                        type="text"
                                        value={specialName}
                                        onChange={e => {
                                            setSpecialName(e.target.value);
                                            setDirty(true);
                                        }}
                                        placeholder="e.g. Late Arrival%%2 Hour Delay"
                                        style={inputStyle}
                                    />
                                </label>
                                <label style={{...labelStyle, flex: '2 1 200px'}}>
                                    <span style={{fontWeight: 'bold'}}>H2 (banner text)</span>
                                    <input
                                        type="text"
                                        value={specialH2}
                                        onChange={e => {
                                            setSpecialH2(e.target.value);
                                            setDirty(true);
                                        }}
                                        style={inputStyle}
                                    />
                                </label>
                                <label style={{...labelStyle, flex: '1 1 90px'}}>
                                    <span style={{fontWeight: 'bold'}}>Base</span>
                                    <select
                                        value={specialBase}
                                        onChange={e => {
                                            setSpecialBase(e.target.value);
                                            setDirty(true);
                                        }}
                                        style={inputStyle}
                                    >
                                        <option value="none">none</option>
                                        {REGULARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </label>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.85rem',
                                    color: '#444',
                                    flex: '1 1 100%',
                                    cursor: 'pointer',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={trulySpecial}
                                        onChange={e => {
                                            setTrulySpecial(e.target.checked);
                                            setDirty(true);
                                        }}
                                    />
                                    Reusable special (assembly, pep rally, …) — surfaces this schedule in the wizard
                                </label>
                            </div>
                        )}

                        {dayType === 'special' && (
                            <ScheduleBlocksEditor
                                blocks={blocks}
                                onChange={handleBlocksChange}
                                editable={blocksEditable}
                                onBeginEdit={promoteToSpecial}
                                onDragStateChange={setDragging}
                            />
                        )}

                        <label style={labelStyle}>
                            <span style={{fontWeight: 'bold'}}>Calendar Note</span>
                            <span style={{color: '#888'}}>Small blue note shown on the calendar cell. Use %% for line breaks.</span>
                            <input
                                type="text"
                                value={calendarEvents}
                                onChange={e => {
                                    setCalendarEvents(e.target.value);
                                    setDirty(true);
                                }}
                                style={inputStyle}
                            />
                        </label>

                        {error && <p style={{color: 'red', margin: 0}}>{error}</p>}
                        {validationError && <p style={{color: '#996600', margin: 0, fontSize: '0.85rem'}}>{validationError}</p>}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginTop: '0.25rem',
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <button
                                    onClick={handleDelete}
                                    disabled={saving || !existsInDb}
                                    title={existsInDb ? 'Delete this day from the database' : 'This day is not in the database'}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        font: 'inherit',
                                        cursor: existsInDb ? 'pointer' : 'not-allowed',
                                        color: '#cc0000',
                                        border: '1px solid #cc0000',
                                        borderRadius: '6px',
                                        background: 'none',
                                        opacity: existsInDb ? 1 : 0.5,
                                    }}
                                >
                                    Delete Day
                                </button>
                                {dayType === 'special' && (
                                    <button
                                        onClick={handleSaveTemplate}
                                        disabled={saving || blocks.length === 0}
                                        title="Save this schedule as a reusable template"
                                        style={{
                                            padding: '0.4rem 1rem',
                                            font: 'inherit',
                                            cursor: blocks.length === 0 ? 'not-allowed' : 'pointer',
                                            color: '#1155cc',
                                            border: '1px solid #1155cc',
                                            borderRadius: '6px',
                                            background: 'none',
                                            opacity: blocks.length === 0 ? 0.5 : 1,
                                        }}
                                    >
                                        Save as template
                                    </button>
                                )}
                            </div>

                            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                {dirty && <span style={{color: '#996600', fontSize: '0.85rem'}}>Unsaved changes</span>}
                                <button
                                    onClick={onClose}
                                    style={{padding: '0.4rem 1rem', cursor: 'pointer', font: 'inherit'}}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !!validationError}
                                    style={{
                                        padding: '0.4rem 1.2rem',
                                        font: 'inherit',
                                        cursor: saving || validationError ? 'not-allowed' : 'pointer',
                                        backgroundColor: '#1155cc',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        opacity: saving || validationError ? 0.6 : 1,
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showWizard && (
                <SpecialWizard
                    defaultBase={dayType}
                    regularSchedules={regularSchedules}
                    onApply={handleWizardApply}
                    onCustom={handleWizardCustom}
                    onCancel={() => setShowWizard(false)}
                />
            )}
        </div>
    );
}
