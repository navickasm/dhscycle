'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {adminFetch} from './adminApi.ts';
import {
    applyModifiers,
    availableModifiers,
    conflictsWith,
    MODIFIER_DESCRIPTIONS,
    MODIFIER_LABELS,
    ModifierId,
    modifiedScheduleName,
    modifierLabel,
    baseLabel,
    ScheduleBlock,
} from './scheduleModifiers.ts';

const REGULARITIES = ['A', '16', '27', '38', '45'] as const;

export interface WizardResult {
    blocks: ScheduleBlock[];
    name: string;
    h2: string | null;
    base: string;
}

interface TemplateRow {
    id: number;
    name: string;
    base: string | null;
    schedule_json: string;
}

interface SpecialDayRow {
    date: string;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
    special_schedule_base: string | null;
    schedule_json: string | null;
    truly_special: number;
}

function isLunch(b: ScheduleBlock): b is Extract<ScheduleBlock, {lunchBlock: true}> {
    return (b as {lunchBlock?: boolean}).lunchBlock === true;
}

function parseBlocks(json: string | null): ScheduleBlock[] {
    if (!json) return [];
    try {
        const parsed = JSON.parse(json.replace(/\\"/g, '"'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function BlockPreview({blocks}: {blocks: ScheduleBlock[]}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '0.5rem 0.7rem',
            fontSize: '0.82rem',
            color: '#333',
            backgroundColor: '#fafafa',
            maxHeight: '14rem',
            overflowY: 'auto',
        }}>
            {blocks.length === 0 && <span style={{color: '#999'}}>No blocks.</span>}
            {blocks.map((b, i) => isLunch(b) ? (
                <div key={i} style={{padding: '0.1rem 0'}}>
                    <div style={{fontWeight: 'bold'}}>Lunch Block ({b.type ?? 'normal'})</div>
                    {b.periods.map((tb, j) => (
                        <div key={`p${j}`} style={{paddingLeft: '0.8rem'}}>
                            <strong>{tb.period}</strong> {tb.start}–{tb.end}
                        </div>
                    ))}
                    {b.lunches.map((tb, j) => (
                        <div key={`l${j}`} style={{paddingLeft: '0.8rem', color: '#996600'}}>
                            <strong>{tb.period}</strong> {tb.start}–{tb.end}
                        </div>
                    ))}
                </div>
            ) : (
                <div key={i}><strong>{b.period}</strong> {b.start}–{b.end}</div>
            ))}
        </div>
    );
}

const sectionButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.7rem 0.9rem',
    font: 'inherit',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f8f9fb',
    color: '#222',
};

export default function SpecialWizard({defaultBase, regularSchedules, onApply, onCustom, onCancel}: {
    defaultBase: string;
    regularSchedules: Record<string, ScheduleBlock[]>;
    onApply: (result: WizardResult) => void;
    onCustom: () => void;
    onCancel: () => void;
}) {
    const [view, setView] = useState<'menu' | 'modifiers' | 'templates' | 'previous'>('menu');

    const [base, setBase] = useState<string>(
        (REGULARITIES as readonly string[]).includes(defaultBase) ? defaultBase : 'A');
    const [selected, setSelected] = useState<Set<ModifierId>>(new Set());

    const baseBlocks = useMemo(() => regularSchedules[base] ?? [], [regularSchedules, base]);
    const avail = useMemo(() => availableModifiers(baseBlocks), [baseBlocks]);
    const previewBlocks = useMemo(
        () => applyModifiers(baseBlocks, [...selected]),
        [baseBlocks, selected]);

    const [templates, setTemplates] = useState<TemplateRow[] | null>(null);
    useEffect(() => {
        if (view !== 'templates' || templates) return;
        adminFetch('/admin/templates')
            .then(r => r.ok ? r.json() : [])
            .then(setTemplates)
            .catch(() => setTemplates([]));
    }, [view, templates]);

    const [specials, setSpecials] = useState<SpecialDayRow[] | null>(null);
    const [showAllSpecials, setShowAllSpecials] = useState(false);
    useEffect(() => {
        if (view !== 'previous' || specials) return;
        adminFetch('/admin/specialDays')
            .then(r => r.ok ? r.json() : [])
            .then(setSpecials)
            .catch(() => setSpecials([]));
    }, [view, specials]);

    const toggleModifier = (id: ModifierId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const applyTemplateRow = (row: TemplateRow) => {
        onApply({
            blocks: parseBlocks(row.schedule_json),
            name: row.name,
            h2: null,
            base: row.base ?? 'none',
        });
    };

    const applyPreviousRow = (row: SpecialDayRow) => {
        onApply({
            blocks: parseBlocks(row.schedule_json),
            name: row.special_schedule_name ?? '',
            h2: row.special_schedule_h2,
            base: row.special_schedule_base ?? 'none',
        });
    };

    const backButton = (
        <button
            onClick={() => setView('menu')}
            style={{border: 'none', background: 'none', color: '#1155cc', cursor: 'pointer', font: 'inherit', padding: 0}}
        >
            ← Back
        </button>
    );

    return (
        <div
            onClick={e => {
                e.stopPropagation();
                onCancel();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Special schedule wizard"
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    width: 'min(520px, calc(100vw - 2rem))',
                    maxHeight: 'calc(100vh - 4rem)',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    color: '#222',
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <h3 style={{margin: 0, fontSize: '1.1rem'}}>Create Special Schedule</h3>
                    <button
                        onClick={onCancel}
                        aria-label="Close"
                        style={{border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#666', lineHeight: 1}}
                    >
                        ×
                    </button>
                </div>

                {view === 'menu' && (
                    <>
                        <button style={sectionButtonStyle} onClick={() => setView('modifiers')}>
                            <strong>Base + Modifiers</strong>
                        </button>
                        <button style={sectionButtonStyle} onClick={() => setView('templates')}>
                            <strong>From Template</strong>
                        </button>
                        <button style={sectionButtonStyle} onClick={() => setView('previous')}>
                            <strong>Previous Special Schedule</strong>
                        </button>
                        <button style={sectionButtonStyle} onClick={onCustom}>
                            <strong>Completely Custom</strong>
                        </button>
                    </>
                )}

                {view === 'modifiers' && (
                    <>
                        {backButton}
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Base:</span>
                            <select
                                value={base}
                                onChange={e => {
                                    setBase(e.target.value);
                                    setSelected(new Set());
                                }}
                                style={{padding: '0.25rem 0.4rem', font: 'inherit', border: '1px solid #ccc', borderRadius: '4px'}}
                            >
                                {REGULARITIES.map(r => <option key={r} value={r}>{baseLabel(r)}</option>)}
                            </select>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.3rem'}}>
                            {(Object.keys(MODIFIER_LABELS) as ModifierId[]).map(id => {
                                const disabled = !avail[id] || (!selected.has(id) && conflictsWith(id, selected));
                                return (
                                    <label
                                        key={id}
                                        title={MODIFIER_DESCRIPTIONS[id]}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            opacity: disabled ? 0.45 : 1,
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.has(id)}
                                            disabled={disabled}
                                            onChange={() => toggleModifier(id)}
                                            style={{marginTop: '0.2rem'}}
                                        />
                                        <span>
                                            <strong>{selected.has(id) ? modifierLabel(id, previewBlocks) : MODIFIER_LABELS[id]}</strong>
                                            <span style={{color: '#777'}}> — {MODIFIER_DESCRIPTIONS[id]}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <BlockPreview blocks={previewBlocks}/>
                        <button
                            onClick={() => onApply({
                                blocks: previewBlocks,
                                name: modifiedScheduleName(base, [...selected], previewBlocks),
                                h2: null,
                                base,
                            })}
                            disabled={selected.size === 0}
                            style={{
                                padding: '0.45rem 1rem',
                                font: 'inherit',
                                fontWeight: 'bold',
                                cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
                                backgroundColor: '#1155cc',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                opacity: selected.size === 0 ? 0.5 : 1,
                            }}
                        >
                            Apply
                        </button>
                    </>
                )}

                {view === 'templates' && (
                    <>
                        {backButton}
                        {templates === null ? (
                            <p style={{margin: 0, color: '#888'}}>Loading templates…</p>
                        ) : templates.length === 0 ? (
                            <p style={{margin: 0, color: '#888'}}>
                                No templates saved yet. Use “Save as template” in the editor to create one.
                            </p>
                        ) : (
                            templates.map(t => (
                                <button key={t.id} style={sectionButtonStyle} onClick={() => applyTemplateRow(t)}>
                                    <strong>{t.name.replace(/%%/g, ' / ')}</strong>
                                    {t.base && t.base !== 'none' &&
                                        <span style={{fontSize: '0.82rem', color: '#666'}}> (base: {t.base})</span>}
                                </button>
                            ))
                        )}
                    </>
                )}

                {view === 'previous' && (
                    <>
                        {backButton}
                        {specials === null ? (
                            <p style={{margin: 0, color: '#888'}}>Loading past specials…</p>
                        ) : specials.length === 0 ? (
                            <p style={{margin: 0, color: '#888'}}>No past special schedules found.</p>
                        ) : (
                            <>
                                {specials.filter(s => s.truly_special).map(s => (
                                    <button key={`t-${s.date}-${s.special_schedule_name}`} style={sectionButtonStyle}
                                            onClick={() => applyPreviousRow(s)}>
                                        <strong>{(s.special_schedule_name ?? 'Unnamed').replace(/%%/g, ' / ')}</strong>
                                        <div style={{fontSize: '0.82rem', color: '#666'}}>Last used {s.date}</div>
                                    </button>
                                ))}
                                {specials.some(s => !s.truly_special) && (
                                    <>
                                        <button
                                            onClick={() => setShowAllSpecials(v => !v)}
                                            style={{border: 'none', background: 'none', color: '#1155cc', cursor: 'pointer', font: 'inherit', textAlign: 'left', padding: 0, fontSize: '0.85rem'}}
                                        >
                                            {showAllSpecials ? '▾ Hide' : '▸ Show'} all other past specials ({specials.filter(s => !s.truly_special).length})
                                        </button>
                                        {showAllSpecials && specials.filter(s => !s.truly_special).map(s => (
                                            <button key={`o-${s.date}-${s.special_schedule_name}`} style={sectionButtonStyle}
                                                    onClick={() => applyPreviousRow(s)}>
                                                <strong>{(s.special_schedule_name ?? 'Unnamed').replace(/%%/g, ' / ')}</strong>
                                                <div style={{fontSize: '0.82rem', color: '#666'}}>Last used {s.date}</div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
