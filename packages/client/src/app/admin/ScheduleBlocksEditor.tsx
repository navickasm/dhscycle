'use client';

import React, {useState} from 'react';
import {LunchBlock, Period, TimeBlock} from '../../schedule.ts';

export type ScheduleBlock = TimeBlock | LunchBlock;

export function isLunchBlock(block: ScheduleBlock): block is LunchBlock {
    return (block as LunchBlock).lunchBlock === true;
}

export function parseBlocks(json: string | null): ScheduleBlock[] {
    if (!json) return [];
    try {
        const parsed = JSON.parse(json.replace(/\\"/g, '"'));
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Failed to parse schedule JSON:', err);
        return [];
    }
}

export function validateBlocks(blocks: ScheduleBlock[]): string | null {
    for (const block of blocks) {
        const inner: TimeBlock[] = isLunchBlock(block) ? [...block.periods, ...block.lunches] : [block];
        for (const tb of inner) {
            if (!tb.period) return 'Every block needs a period label.';
            if (!tb.start || !tb.end) return `Block "${tb.period}" is missing a start or end time.`;
            if (tb.start >= tb.end) return `Block "${tb.period}" must start before it ends.`;
        }
    }
    return null;
}

export function makeLunchBlockSkeleton(): LunchBlock {
    return {
        lunchBlock: true,
        type: 'normal',
        periods: [
            {period: Period.FOUR_A, start: '', end: ''},
            {period: Period.FOUR_B, start: '', end: ''},
            {period: Period.FIVE_A, start: '', end: ''},
            {period: Period.FIVE_B, start: '', end: ''},
        ],
        lunches: [
            {period: Period.L1, start: '', end: ''},
            {period: Period.L2, start: '', end: ''},
            {period: Period.L3, start: '', end: ''},
        ],
    };
}

function convertLunchBlockType(block: LunchBlock, type: LunchBlock['type']): LunchBlock {
    if (type === block.type) return block;
    const periodLabels = type === 'friday'
        ? [Period.SIX_A, Period.SIX_B]
        : [Period.FOUR_A, Period.FOUR_B, Period.FIVE_A, Period.FIVE_B];
    const lunchLabels = type === 'friday'
        ? [Period.LA, Period.LB, Period.LC]
        : [Period.L1, Period.L2, Period.L3];
    return {
        ...block,
        type,
        periods: periodLabels.map((p, i) => ({
            period: p,
            start: block.periods[i]?.start ?? '',
            end: block.periods[i]?.end ?? '',
        })),
        lunches: lunchLabels.map((p, i) => ({
            period: p,
            start: block.lunches[i]?.start ?? '',
            end: block.lunches[i]?.end ?? '',
        })),
    };
}

const BLOCK_ORDER: string[] = [
    Period.EB, Period.SC, Period.HR, Period.PEP, Period.ONE, Period.TWO, Period.THREE,
    'LUNCH', Period.SIX, Period.SEVEN, Period.EIGHT,
];

export function blockOrderIndex(block: ScheduleBlock): number {
    const key = isLunchBlock(block) ? 'LUNCH' : block.period;
    const idx = BLOCK_ORDER.indexOf(key);
    return idx === -1 ? BLOCK_ORDER.length : idx;
}

const PALETTE_PERIODS: Period[] = [
    Period.EB, Period.ONE, Period.TWO, Period.THREE, Period.SIX, Period.SEVEN, Period.EIGHT,
    Period.HR, Period.SC, Period.PEP,
];

const inputStyle: React.CSSProperties = {
    padding: '0.25rem 0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    font: 'inherit',
};

function TimeInputs({block, disabled, onChange}: {
    block: TimeBlock;
    disabled: boolean;
    onChange: (updated: TimeBlock) => void;
}) {
    return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.3rem'}}>
            <input
                type="time"
                value={block.start}
                disabled={disabled}
                onChange={e => onChange({...block, start: e.target.value})}
                style={inputStyle}
            />
            –
            <input
                type="time"
                value={block.end}
                disabled={disabled}
                onChange={e => onChange({...block, end: e.target.value})}
                style={inputStyle}
            />
        </span>
    );
}

function BlockCard({block, index, dragIndex, editable, onDragStart, onDragOver, onDrop, onDragEnd, onChange, onRemove, onBeginEdit}: {
    block: ScheduleBlock;
    index: number;
    dragIndex: number | null;
    editable: boolean;
    onDragStart: (index: number) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDrop: (index: number) => void;
    onDragEnd: () => void;
    onChange: (index: number, updated: ScheduleBlock) => void;
    onRemove: (index: number) => void;
    onBeginEdit: () => void;
}) {
    const isDragging = dragIndex === index;

    const updateInner = (list: 'periods' | 'lunches', i: number, updated: TimeBlock) => {
        if (!isLunchBlock(block)) return;
        const next = {...block, [list]: block[list].map((tb, idx) => idx === i ? updated : tb)};
        onChange(index, next);
    };

    return (
        <div
            draggable
            onDragStart={() => {
                onBeginEdit();
                onDragStart(index);
            }}
            onDragOver={e => onDragOver(e, index)}
            onDrop={() => onDrop(index)}
            onDragEnd={onDragEnd}
            onMouseDown={editable ? undefined : onBeginEdit}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.5rem 0.6rem',
                border: '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor: isDragging ? '#e8f0fe' : '#ffffff',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                userSelect: 'none',
            }}
        >
            <span style={{color: '#999', fontSize: '1.1rem', lineHeight: 1.6}} aria-hidden>⠿</span>

            {isLunchBlock(block) ? (
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{fontWeight: 'bold'}}>Lunch Block</span>
                        <select
                            value={block.type}
                            disabled={!editable}
                            onChange={e => onChange(index, convertLunchBlockType(block, e.target.value as LunchBlock['type']))}
                            style={inputStyle}
                        >
                            <option value="normal">normal</option>
                            <option value="friday">friday</option>
                        </select>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        {block.periods.map((tb, i) => (
                            <div key={`p-${i}`} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <span style={{minWidth: '2.2rem', fontWeight: 'bold', fontSize: '0.85rem'}}>{tb.period}</span>
                                <TimeInputs block={tb} disabled={!editable} onChange={u => updateInner('periods', i, u)}/>
                            </div>
                        ))}
                        {block.lunches.map((tb, i) => (
                            <div key={`l-${i}`} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <span style={{minWidth: '2.2rem', fontWeight: 'bold', fontSize: '0.85rem', color: '#996600'}}>{tb.period}</span>
                                <TimeInputs block={tb} disabled={!editable} onChange={u => updateInner('lunches', i, u)}/>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap'}}>
                    <input
                        type="text"
                        value={block.period}
                        disabled={!editable}
                        onChange={e => onChange(index, {...block, period: e.target.value as Period})}
                        style={{...inputStyle, width: '3.2rem', fontWeight: 'bold'}}
                        aria-label="Period"
                    />
                    <TimeInputs block={block} disabled={!editable} onChange={u => onChange(index, u as ScheduleBlock)}/>
                </div>
            )}

            <button
                onClick={() => onRemove(index)}
                aria-label="Remove block"
                title="Remove block"
                style={{
                    border: 'none',
                    background: 'none',
                    color: '#cc0000',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    padding: '0 0.2rem',
                }}
            >
                ✕
            </button>
        </div>
    );
}

export interface ScheduleBlocksEditorProps {
    blocks: ScheduleBlock[];
    onChange: (blocks: ScheduleBlock[]) => void;
    editable?: boolean;
    onBeginEdit?: () => void;
    onDragStateChange?: (dragging: boolean) => void;
}

export default function ScheduleBlocksEditor({blocks, onChange, editable = true, onBeginEdit, onDragStateChange}: ScheduleBlocksEditorProps) {
    const [dragIndex, setDragIndexRaw] = useState<number | null>(null);

    const setDragIndex = (idx: number | null) => {
        setDragIndexRaw(idx);
        onDragStateChange?.(idx !== null);
    };

    const beginEdit = () => onBeginEdit?.();

    const handleBlockChange = (index: number, updated: ScheduleBlock) => {
        beginEdit();
        onChange(blocks.map((b, i) => i === index ? updated : b));
    };

    const handleBlockRemove = (index: number) => {
        beginEdit();
        onChange(blocks.filter((_, i) => i !== index));
    };

    const handleAddBlock = (block: ScheduleBlock) => {
        beginEdit();
        const order = blockOrderIndex(block);
        let insertAt = blocks.length;
        for (let i = 0; i < blocks.length; i++) {
            if (blockOrderIndex(blocks[i]) > order) {
                insertAt = i;
                break;
            }
        }
        const next = [...blocks];
        next.splice(insertAt, 0, block);
        onChange(next);
    };

    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (index: number) => {
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            return;
        }
        beginEdit();
        const next = [...blocks];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);
        onChange(next);
        setDragIndex(null);
    };
    const handleDragEnd = () => setDragIndex(null);

    return (
        <>
            {blocks.length === 0 ? (
                <p style={{
                    textAlign: 'center',
                    padding: '1.25rem',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    color: '#888',
                    margin: 0,
                }}>
                    No schedule blocks. Add some below.
                </p>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {blocks.map((block, index) => (
                        <BlockCard
                            key={index}
                            block={block}
                            index={index}
                            dragIndex={dragIndex}
                            editable={editable}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            onChange={handleBlockChange}
                            onRemove={handleBlockRemove}
                            onBeginEdit={beginEdit}
                        />
                    ))}
                </div>
            )}

            <div>
                <p style={{margin: '0 0 0.3rem', fontWeight: 'bold', fontSize: '0.85rem', color: '#444'}}>
                    Add block:
                </p>
                <div style={{display: 'flex', gap: '0.3rem', flexWrap: 'wrap'}}>
                    {PALETTE_PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => handleAddBlock({period: p, start: '', end: ''})}
                            style={{
                                padding: '0.25rem 0.6rem',
                                font: 'inherit',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                border: '1px dashed #999',
                                borderRadius: '5px',
                                backgroundColor: '#fafafa',
                                color: '#333',
                            }}
                        >
                            + {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handleAddBlock(makeLunchBlockSkeleton())}
                        style={{
                            padding: '0.25rem 0.6rem',
                            font: 'inherit',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            border: '1px dashed #996600',
                            borderRadius: '5px',
                            backgroundColor: '#fffaf0',
                            color: '#996600',
                        }}
                    >
                        + Lunch Block
                    </button>
                </div>
            </div>
        </>
    );
}
