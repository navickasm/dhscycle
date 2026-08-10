'use client';

import {LunchBlock, Period, TimeBlock} from '../../schedule.ts';

export type ScheduleBlock = TimeBlock | LunchBlock;

const PASS = 5;
const LUNCH_LEN = 30;
const HR_LEN = 15;
const EX_HR_LEN = 45;
const EB_START = '07:14';

export const EX_HR_LABEL = 'Ex HR';

function toMin(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function toTime(n: number): string {
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

function isLunch(b: ScheduleBlock): b is LunchBlock {
    return (b as LunchBlock).lunchBlock === true;
}

const isEB = (b: ScheduleBlock) => !isLunch(b) && b.period === Period.EB;
const isSC = (b: ScheduleBlock) => !isLunch(b) && b.period === Period.SC;
const isHR = (b: ScheduleBlock) => !isLunch(b) && b.period === Period.HR;
const isPre = (b: ScheduleBlock) => isEB(b) || isSC(b);

export type ModifierId = 'addEB' | 'noEB' | 'addHR' | 'noHR' | 'exHR';

export const MODIFIER_LABELS: Record<ModifierId, string> = {
    addEB: 'Add EB',
    noEB: 'No EB',
    addHR: 'Add HR',
    noHR: 'No HR',
    exHR: 'Ex HR',
};

export const MODIFIER_DESCRIPTIONS: Record<ModifierId, string> = {
    addEB: 'Adds EB from 7:14 (replaces SC)',
    noEB: 'Cancels EB',
    addHR: 'Inserts Homeroom so the day starts at 8:20',
    noHR: 'Removes Homeroom so the day starts at 8:40',
    exHR: '45-minute Extended Homeroom',
};

export function availableModifiers(blocks: ScheduleBlock[]): Record<ModifierId, boolean> {
    const hasEB = blocks.some(isEB);
    const hasHR = blocks.some(isHR);
    return {
        addEB: !hasEB,
        noEB: hasEB,
        addHR: !hasHR,
        noHR: hasHR,
        exHR: hasHR,
    };
}

const CONFLICTS: [ModifierId, ModifierId][] = [
    ['noHR', 'exHR'],
    ['addEB', 'noEB'],
    ['addHR', 'noHR'],
];

export function conflictsWith(id: ModifierId, selected: Set<ModifierId>): boolean {
    return CONFLICTS.some(([a, b]) =>
        (a === id && selected.has(b)) || (b === id && selected.has(a)));
}

function shiftTimeBlock(b: TimeBlock, delta: number): TimeBlock {
    return {...b, start: toTime(toMin(b.start) + delta), end: toTime(toMin(b.end) + delta)};
}

function fixPreEnds(blocks: ScheduleBlock[]): ScheduleBlock[] {
    const fm = blocks.findIndex(b => !isPre(b));
    if (fm <= 0) return blocks;
    const mainStart = toMin((blocks[fm] as TimeBlock).start ?? (blocks[fm] as LunchBlock).periods[0].start);
    return blocks.map((b, i) =>
        i < fm && !isLunch(b) ? {...b, end: toTime(mainStart - PASS)} : b);
}

function blockStart(b: ScheduleBlock): number {
    return toMin(isLunch(b) ? b.periods[0].start : b.start);
}

function blockEnd(b: ScheduleBlock): number {
    if (!isLunch(b)) return toMin(b.end);
    return Math.max(...b.periods.map(tb => toMin(tb.end)), ...b.lunches.map(tb => toMin(tb.end)));
}

function applyNoEB(blocks: ScheduleBlock[]): ScheduleBlock[] {
    return blocks.filter(b => !isEB(b));
}

function applyAddEB(blocks: ScheduleBlock[]): ScheduleBlock[] {
    if (blocks.some(isEB)) return blocks;
    const withoutSC = blocks.filter(b => !isSC(b));
    const fm = withoutSC.findIndex(b => !isPre(b));
    if (fm === -1) return blocks;
    const mainStart = blockStart(withoutSC[fm]);
    const eb: TimeBlock = {period: Period.EB, start: EB_START, end: toTime(mainStart - PASS)};
    return [eb, ...withoutSC];
}

function applyNoHR(blocks: ScheduleBlock[]): ScheduleBlock[] {
    const hrIdx = blocks.findIndex(isHR);
    if (hrIdx === -1) return blocks;
    const hr = blocks[hrIdx] as TimeBlock;
    const shift = (toMin(hr.end) - toMin(hr.start)) + PASS;
    const out: ScheduleBlock[] = [];
    blocks.forEach((b, i) => {
        if (i === hrIdx) return;
        if (i < hrIdx && !isPre(b) && !isLunch(b)) out.push(shiftTimeBlock(b, shift));
        else out.push(b);
    });
    return fixPreEnds(out);
}

function applyAddHR(blocks: ScheduleBlock[]): ScheduleBlock[] {
    if (blocks.some(isHR)) return blocks;
    const fm = blocks.findIndex(b => !isPre(b));
    if (fm === -1) return blocks;
    const mainStart = blockStart(blocks[fm]);
    const hr: TimeBlock = {
        period: Period.HR,
        start: toTime(mainStart - HR_LEN - PASS),
        end: toTime(mainStart - PASS),
    };
    const out = [...blocks.slice(0, fm), hr, ...blocks.slice(fm)];
    return fixPreEnds(out);
}

function layoutLunch(b: LunchBlock, T: number, P: number): LunchBlock {
    const end = T + 2 * P + 40;
    if (b.type === 'friday') {
        const periods = b.periods.map((tb, i) => {
            if (i === 0) return {...tb, start: toTime(T), end: toTime(T + P)};
            if (i === b.periods.length - 1) return {...tb, start: toTime(T + P + 40), end: toTime(end)};
            return {...tb, start: toTime(T + P + PASS), end: toTime(T + 2 * P + PASS)};
        });
        const lunchTimes = [
            {start: T + P - LUNCH_LEN, end: T + P},
            {start: T + P + PASS, end: T + P + PASS + LUNCH_LEN},
            {start: end - LUNCH_LEN, end},
        ];
        const lunches = b.lunches.map((tb, i) => {
            const lt = lunchTimes[Math.min(i, lunchTimes.length - 1)];
            return {...tb, start: toTime(lt.start), end: toTime(lt.end)};
        });
        return {...b, periods, lunches};
    }
    const p4a = {start: T, end: T + P};
    const l1 = {start: T, end: T + LUNCH_LEN};
    const p4b = {start: l1.end + PASS, end: l1.end + PASS + P};
    const p5a = {start: p4a.end + PASS, end: p4a.end + PASS + P};
    const l2 = {start: p4a.end + PASS, end: p4a.end + PASS + LUNCH_LEN};
    const p5b = {start: p4b.end + PASS, end: p4b.end + PASS + P};
    const l3 = {start: end - LUNCH_LEN, end};
    const periodTimes = [p4a, p4b, p5a, p5b];
    const lunchTimes = [l1, l2, l3];
    return {
        ...b,
        periods: b.periods.map((tb, i) => {
            const pt = periodTimes[Math.min(i, periodTimes.length - 1)];
            return {...tb, start: toTime(pt.start), end: toTime(pt.end)};
        }),
        lunches: b.lunches.map((tb, i) => {
            const lt = lunchTimes[Math.min(i, lunchTimes.length - 1)];
            return {...tb, start: toTime(lt.start), end: toTime(lt.end)};
        }),
    };
}

function applyExHR(blocks: ScheduleBlock[]): ScheduleBlock[] {
    if (!blocks.some(isHR)) return blocks;
    const pre = blocks.filter(isPre);
    const main = blocks.filter(b => !isPre(b));
    const mainStart = blockStart(main[0]);
    const dayEnd = blockEnd(main[main.length - 1]);

    const rest = main.filter(b => !isHR(b));
    const exHR: TimeBlock = {period: EX_HR_LABEL as Period, start: '', end: ''};
    const p1Idx = rest.findIndex(b => !isLunch(b) && b.period === Period.ONE);
    const seq = [...rest];
    seq.splice(p1Idx >= 0 ? p1Idx + 1 : 0, 0, exHR);

    let units = 0;
    let fixed = 0;
    for (const b of seq) {
        if (isLunch(b)) {
            units += 2;
            fixed += 40;
        } else if (b === exHR) {
            fixed += EX_HR_LEN;
        } else {
            units += 1;
        }
    }
    const gaps = (seq.length - 1) * PASS;
    const P = Math.round((dayEnd - mainStart - fixed - gaps) / units);

    let t = mainStart;
    const out: ScheduleBlock[] = [];
    for (const b of seq) {
        if (isLunch(b)) {
            out.push(layoutLunch(b, t, P));
            t += 2 * P + 40 + PASS;
        } else if (b === exHR) {
            out.push({...b, start: toTime(t), end: toTime(t + EX_HR_LEN)});
            t += EX_HR_LEN + PASS;
        } else {
            out.push({...b, start: toTime(t), end: toTime(t + P)});
            t += P + PASS;
        }
    }
    return [...pre, ...out];
}

const APPLY_ORDER: ModifierId[] = ['exHR', 'noHR', 'addHR', 'noEB', 'addEB'];

const APPLY_FNS: Record<ModifierId, (blocks: ScheduleBlock[]) => ScheduleBlock[]> = {
    addEB: applyAddEB,
    noEB: applyNoEB,
    addHR: applyAddHR,
    noHR: applyNoHR,
    exHR: applyExHR,
};

export function applyModifiers(blocks: ScheduleBlock[], modifiers: ModifierId[]): ScheduleBlock[] {
    let out = blocks.map(b => isLunch(b)
        ? {...b, periods: b.periods.map(tb => ({...tb})), lunches: b.lunches.map(tb => ({...tb}))}
        : {...b});
    for (const id of APPLY_ORDER) {
        if (modifiers.includes(id)) out = APPLY_FNS[id](out);
    }
    return out;
}

export function baseLabel(regularity: string): string {
    return regularity === 'A' ? 'Anchor Day' : `Cycle ${regularity}`;
}

export function ebDuration(blocks: ScheduleBlock[]): number | null {
    const eb = blocks.find(isEB) as TimeBlock | undefined;
    if (!eb || !eb.start || !eb.end) return null;
    return toMin(eb.end) - toMin(eb.start);
}

export function modifierLabel(id: ModifierId, finalBlocks?: ScheduleBlock[]): string {
    if (id === 'addEB' && finalBlocks) {
        const d = ebDuration(finalBlocks);
        if (d !== null) return `Add ${d}m EB`;
    }
    return MODIFIER_LABELS[id];
}

export function modifiedScheduleName(regularity: string, modifiers: ModifierId[], finalBlocks?: ScheduleBlock[]): string {
    const parts = [
        baseLabel(regularity),
        ...APPLY_ORDER.filter(m => modifiers.includes(m)).map(m => modifierLabel(m, finalBlocks)),
    ];
    return parts.join('%%');
}
