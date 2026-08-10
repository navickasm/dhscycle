'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {adminFetch} from '../adminApi.ts';
import ScheduleBlocksEditor, {parseBlocks, ScheduleBlock, validateBlocks} from '../ScheduleBlocksEditor.tsx';
import {baseLabel} from '../scheduleModifiers.ts';

const REGULARITIES = ['A', '16', '27', '38', '45'] as const;

interface TemplateRow {
    id: number;
    name: string;
    base: string | null;
    modifications_json: string | null;
    schedule_json: string;
}

interface RegularScheduleRow {
    regularity: string;
    name: string | null;
    schedule_json: string | null;
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

const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '0.6rem 0.8rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
};

const smallButtonStyle: React.CSSProperties = {
    padding: '0.3rem 0.8rem',
    font: 'inherit',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
    color: '#333',
};

type EditorTarget =
    | { kind: 'template'; template: TemplateRow | null }
    | { kind: 'regular'; row: RegularScheduleRow };

function EditorPopup({target, regularSchedules, onClose, onSaved}: {
    target: EditorTarget;
    regularSchedules: RegularScheduleRow[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const isTemplate = target.kind === 'template';
    const initial = useMemo(() => {
        if (target.kind === 'template') {
            return {
                name: target.template?.name ?? '',
                base: target.template?.base ?? 'none',
                blocks: parseBlocks(target.template?.schedule_json ?? null),
            };
        }
        return {
            name: target.row.name ?? '',
            base: 'none',
            blocks: parseBlocks(target.row.schedule_json),
        };
    }, [target]);

    const [name, setName] = useState(initial.name);
    const [base, setBase] = useState(initial.base);
    const [blocks, setBlocks] = useState<ScheduleBlock[]>(initial.blocks);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    const validationError = useMemo(() => {
        if (!name.trim()) return 'A name is required.';
        if (blocks.length === 0) return 'Add at least one schedule block.';
        return validateBlocks(blocks);
    }, [name, blocks]);

    const handleBaseChange = (next: string) => {
        setBase(next);
        setDirty(true);
        if (blocks.length === 0 && next !== 'none') {
            const reg = regularSchedules.find(r => r.regularity === next);
            const regBlocks = parseBlocks(reg?.schedule_json ?? null);
            if (regBlocks.length > 0) {
                setBlocks(regBlocks);
            }
        }
    };

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (validationError) return false;
        setSaving(true);
        setError(null);
        try {
            let res: Response;
            if (target.kind === 'regular') {
                res = await adminFetch(`/admin/regularSchedules/${target.row.regularity}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: name.trim() || null,
                        schedule_json: JSON.stringify(blocks),
                    }),
                });
            } else if (target.template) {
                res = await adminFetch(`/admin/templates/${target.template.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: name.trim(),
                        base: base === 'none' ? null : base,
                        schedule_json: JSON.stringify(blocks),
                    }),
                });
            } else {
                res = await adminFetch('/admin/templates', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: name.trim(),
                        base: base === 'none' ? null : base,
                        schedule_json: JSON.stringify(blocks),
                    }),
                });
            }
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? `HTTP error! status: ${res.status}`);
            }
            setDirty(false);
            onSaved();
            return true;
        } catch (err) {
            console.error('Error saving:', err);
            setError(err instanceof Error ? err.message : 'Failed to save.');
            return false;
        } finally {
            setSaving(false);
        }
    }, [validationError, target, name, base, blocks, onSaved]);

    const handleClose = useCallback(async (forceSave = false) => {
        if ((dirty || forceSave) && !saving && !validationError) {
            const ok = await handleSave();
            if (!ok) return;
        }
        onClose();
    }, [dirty, saving, validationError, handleSave, onClose]);

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

    const title = target.kind === 'regular'
        ? `Edit ${baseLabel(target.row.regularity)} (${target.row.regularity})`
        : target.template
            ? `Edit Template: ${target.template.name}`
            : 'New Template';

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
                aria-label={title}
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
                    <h2 style={{margin: 0, fontSize: '1.25rem'}}>{title}</h2>
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

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.75rem'}}>
                    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                        <label style={{...labelStyle, flex: '2 1 200px'}}>
                            <span style={{fontWeight: 'bold'}}>Name</span>
                            <input
                                type="text"
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    setDirty(true);
                                }}
                                placeholder={isTemplate ? 'e.g. Anchor Day%%Ex HR' : 'e.g. Anchor Day'}
                                style={inputStyle}
                            />
                        </label>
                        {isTemplate && (
                            <label style={{...labelStyle, flex: '1 1 90px'}}>
                                <span style={{fontWeight: 'bold'}}>Base</span>
                                <select
                                    value={base}
                                    onChange={e => handleBaseChange(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="none">none</option>
                                    {REGULARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </label>
                        )}
                    </div>

                    {target.kind === 'regular' && (
                        <p style={{
                            margin: 0,
                            padding: '0.4rem 0.6rem',
                            backgroundColor: '#fff8e1',
                            border: '1px solid #e6c200',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                        }}>
                            This is a default schedule. Changes affect every {target.row.regularity} day that doesn't have a special override.
                        </p>
                    )}

                    <ScheduleBlocksEditor
                        blocks={blocks}
                        onChange={next => {
                            setBlocks(next);
                            setDirty(true);
                        }}
                        onDragStateChange={setDragging}
                    />

                    {error && <p style={{color: 'red', margin: 0}}>{error}</p>}
                    {dirty && validationError && (
                        <p style={{color: '#996600', margin: 0, fontSize: '0.85rem'}}>{validationError}</p>
                    )}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '0.25rem',
                    }}>
                        {dirty && <span style={{color: '#996600', fontSize: '0.85rem'}}>Unsaved changes</span>}
                        <button
                            onClick={onClose}
                            style={{padding: '0.4rem 1rem', cursor: 'pointer', font: 'inherit'}}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => void handleSave().then(ok => ok && onClose())}
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
        </div>
    );
}

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<TemplateRow[]>([]);
    const [regularSchedules, setRegularSchedules] = useState<RegularScheduleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorTarget, setEditorTarget] = useState<EditorTarget | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const [tplRes, regRes] = await Promise.all([
                adminFetch('/admin/templates'),
                adminFetch('/admin/regularSchedules'),
            ]);
            if (!tplRes.ok || !regRes.ok) {
                throw new Error('Failed to load data');
            }
            const tpls: TemplateRow[] = await tplRes.json();
            const regs: RegularScheduleRow[] = await regRes.json();
            setTemplates(tpls);
            setRegularSchedules(
                [...regs].sort((a, b) =>
                    REGULARITIES.indexOf(a.regularity as typeof REGULARITIES[number])
                    - REGULARITIES.indexOf(b.regularity as typeof REGULARITIES[number]))
            );
        } catch (err) {
            console.error('Error loading templates page:', err);
            setError('Failed to load data. Are you logged in?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleDeleteTemplate = async (tpl: TemplateRow) => {
        if (!window.confirm(`Delete template "${tpl.name}"? This cannot be undone.`)) return;
        try {
            const res = await adminFetch(`/admin/templates/${tpl.id}`, {method: 'DELETE'});
            if (!res.ok && res.status !== 404) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            void load();
        } catch (err) {
            console.error('Error deleting template:', err);
            setError('Failed to delete template.');
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px'}}>
            <h1 style={{margin: 0}}>Schedule Templates</h1>

            {error && <p style={{color: 'red', margin: 0}}>{error}</p>}
            {loading ? (
                <p>Loading…</p>
            ) : (
                <>
                    <section style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <h2 style={{margin: '0 0 0.25rem', fontSize: '1.1rem'}}>Default Schedules</h2>
                        {regularSchedules.map(row => (
                            <div key={row.regularity} style={cardStyle}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                                    <span style={{fontWeight: 'bold'}}>{row.name ?? baseLabel(row.regularity)}</span>
                                </div>
                                <button
                                    onClick={() => setEditorTarget({kind: 'regular', row})}
                                    style={smallButtonStyle}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </section>

                    <section style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <h2 style={{margin: 0, fontSize: '1.1rem'}}>Templates</h2>
                            <button
                                onClick={() => setEditorTarget({kind: 'template', template: null})}
                                style={{
                                    ...smallButtonStyle,
                                    backgroundColor: '#1155cc',
                                    color: '#ffffff',
                                    border: '1px solid #1155cc',
                                    fontWeight: 'bold',
                                }}
                            >
                                + New Template
                            </button>
                        </div>
                        {templates.length === 0 ? (
                            <p style={{
                                textAlign: 'center',
                                padding: '1.25rem',
                                border: '2px dashed #ccc',
                                borderRadius: '8px',
                                color: '#888',
                                margin: 0,
                            }}>
                                No templates yet. Create one, or use &quot;Save as template&quot; from the calendar editor.
                            </p>
                        ) : (
                            templates.map(tpl => (
                                <div key={tpl.id} style={cardStyle}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap'}}>
                                        <span style={{fontWeight: 'bold'}}>{tpl.name}</span>
                                        {tpl.base && (
                                            <span style={{
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '5px',
                                                backgroundColor: '#fff8e1',
                                                border: '1px solid #e6c200',
                                                color: '#996600',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                            }}>
                                                base: {tpl.base}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{display: 'flex', gap: '0.4rem'}}>
                                        <button
                                            onClick={() => setEditorTarget({kind: 'template', template: tpl})}
                                            style={smallButtonStyle}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => void handleDeleteTemplate(tpl)}
                                            style={{
                                                ...smallButtonStyle,
                                                color: '#cc0000',
                                                border: '1px solid #cc0000',
                                                backgroundColor: '#ffffff',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}

            {editorTarget && (
                <EditorPopup
                    target={editorTarget}
                    regularSchedules={regularSchedules}
                    onClose={() => setEditorTarget(null)}
                    onSaved={() => void load()}
                />
            )}
        </div>
    );
}
