'use client';

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {CalendarCell, CalendarCellData} from "./CalendarCell.tsx";

import styles from "./calendar.module.css";

export interface YearMonth {
    year: number;
    month: number;
}

export interface CalendarProps {
    cells: CalendarCellData[];
    onCellClick?: (date: Date) => void;
    isAdmin?: boolean;
    todayDate?: string;
    selectedDate?: string;
    months?: YearMonth[];
    monthIndex?: number;
    onMonthChange?: (index: number) => void;
    showYear?: boolean;
}

function toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function columnIndex(d: Date): number {
    return (d.getUTCDay() + 6) % 7;
}

function buildWeekRows(cells: CalendarCellData[]): (CalendarCellData | null)[][] {
    const sorted = [...cells].sort((a, b) => a.date.getTime() - b.date.getTime());
    const weekdayCells = sorted.filter(c => columnIndex(c.date) <= 4);
    if (weekdayCells.length === 0) return [];

    const first = weekdayCells[0].date;
    const gridStart = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate())
        - columnIndex(first) * MS_PER_DAY;

    const rows: (CalendarCellData | null)[][] = [];
    for (const cell of weekdayCells) {
        const dayOffset = Math.floor((Date.UTC(
            cell.date.getUTCFullYear(),
            cell.date.getUTCMonth(),
            cell.date.getUTCDate(),
        ) - gridStart) / MS_PER_DAY);
        const rowIndex = Math.floor(dayOffset / 7);
        while (rows.length <= rowIndex) rows.push([null, null, null, null, null]);
        rows[rowIndex][columnIndex(cell.date)] = cell;
    }
    return rows;
}

function ymLabel(ym: YearMonth, showYear?: boolean): string {
    return new Date(Date.UTC(ym.year, ym.month - 1, 1)).toLocaleString('en-US', {
        month: 'long',
        ...(showYear ? {year: 'numeric'} : {}),
        timeZone: 'UTC',
    });
}

function MonthDropdown(p: {
    months: YearMonth[];
    monthIndex: number;
    onMonthChange: (index: number) => void;
    showYear?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [listPos, setListPos] = useState<{top: number; left: number; maxHeight: number} | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const computePos = () => {
        if (!toggleRef.current) return null;
        const rect = toggleRef.current.getBoundingClientRect();
        const top = rect.bottom + 4;
        return {
            top,
            left: rect.left + rect.width / 2,
            maxHeight: Math.max(96, window.innerHeight - top - 16),
        };
    };

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (containerRef.current?.contains(target)) return;
            if (listRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const handleReposition = () => {
            setListPos(computePos());
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        window.addEventListener('scroll', handleReposition, true);
        window.addEventListener('resize', handleReposition);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
            window.removeEventListener('scroll', handleReposition, true);
            window.removeEventListener('resize', handleReposition);
        };
    }, [open]);

    const toggleOpen = () => {
        if (!open) {
            setListPos(computePos());
        }
        setOpen(o => !o);
    };

    return (
        <div ref={containerRef} className={styles.monthDropdown}>
            <button
                type="button"
                ref={toggleRef}
                className={p.showYear
                    ? `${styles.monthDropdownToggle} ${styles.monthDropdownToggleWide}`
                    : styles.monthDropdownToggle}
                onClick={toggleOpen}
                aria-haspopup="listbox"
                aria-expanded={open}
                title="Select month"
            >
                {ymLabel(p.months[p.monthIndex], p.showYear)}
            </button>
            {open && listPos && createPortal(
                <ul
                    ref={listRef}
                    className={styles.monthDropdownList}
                    role="listbox"
                    style={{top: listPos.top, left: listPos.left, maxHeight: listPos.maxHeight}}
                >
                    {p.months.map((ym, i) => (
                        <li
                            key={`${ym.year}-${ym.month}`}
                            role="option"
                            aria-selected={i === p.monthIndex}
                            className={i === p.monthIndex
                                ? `${styles.monthDropdownItem} ${styles.monthDropdownItemSelected}`
                                : styles.monthDropdownItem}
                            onClick={() => {
                                p.onMonthChange(i);
                                setOpen(false);
                            }}
                        >
                            {ymLabel(ym, p.showYear)}
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
}

export default function Calendar(p: CalendarProps) {
    const hasNav = !!(p.months && p.months.length > 0 && p.monthIndex !== undefined && p.onMonthChange);

    if ((!p.cells || p.cells.length === 0) && !hasNav) {
        return <p><b>Error:</b> No calendar data available.</p>;
    }

    const weekRows = buildWeekRows(p.cells);

    const header = hasNav ? (
        <div className={styles.monthNav}>
            <button
                type="button"
                className={styles.monthNavArrow}
                onClick={() => p.onMonthChange!(p.monthIndex! - 1)}
                disabled={p.monthIndex! <= 0}
                aria-label="Previous month"
            >
                {'\u25C0\uFE0E'}
            </button>
            <MonthDropdown
                months={p.months!}
                monthIndex={p.monthIndex!}
                onMonthChange={p.onMonthChange!}
                showYear={p.showYear}
            />
            <button
                type="button"
                className={styles.monthNavArrow}
                onClick={() => p.onMonthChange!(p.monthIndex! + 1)}
                disabled={p.monthIndex! >= p.months!.length - 1}
                aria-label="Next month"
            >
                {'\u25B6\uFE0E'}
            </button>
        </div>
    ) : (
        p.cells[0].date.toLocaleString('en-US', {month: 'long', timeZone: 'UTC'})
    );

    return (
        <table style={{padding: "1rem", margin: "0 auto"}}>
            <thead>
            <tr>
                <th colSpan={5}>{header}</th>
            </tr>
            </thead>
            <tbody>

            <tr>
                <th className={styles.tableLabel}>M</th>
                <th className={styles.tableLabel}>T</th>
                <th className={styles.tableLabel}>W</th>
                <th className={styles.tableLabel}>H</th>
                <th className={styles.tableLabel}>F</th>
            </tr>

            {weekRows.length === 0 ? (
                <tr>
                    <td colSpan={5} style={{textAlign: 'center', padding: '2rem', color: '#888888'}}>
                        No calendar data available for this month.
                    </td>
                </tr>
            ) : weekRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                    {row.map((cell, colIndex) => cell ? (
                        <CalendarCell
                            key={toDateStr(cell.date)}
                            {...cell}
                            onClick={p.onCellClick}
                            isAdmin={p.isAdmin}
                            isToday={!!p.todayDate && toDateStr(cell.date) === p.todayDate}
                            isSelected={!!p.selectedDate && toDateStr(cell.date) === p.selectedDate}
                        />
                    ) : <td key={`empty-${rowIndex}-${colIndex}`}/>)}
                </tr>
            ))}
            </tbody>
        </table>
    );
};
