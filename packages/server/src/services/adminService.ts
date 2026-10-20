import {getDb} from "../database.js";

export interface ScheduleDayRow {
    date: string;
    regularity: string;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
    special_schedule_base: string | null;
    schedule_json: string | null;
    ref_code: number | null;
    calendar_events: string | null;
    truly_special: number;
}

export interface DayUpsertInput {
    regularity: string;
    special_schedule_name?: string | null;
    special_schedule_h2?: string | null;
    special_schedule_base?: string | null;
    schedule_json?: string | null;
    ref_code?: number | null;
    calendar_events?: string | null;
    truly_special?: boolean | number;
}

export function getDay(date: string): ScheduleDayRow | null {
    const row = getDb().prepare<[string], ScheduleDayRow>(
        `SELECT date, regularity, special_schedule_name, special_schedule_h2,
                special_schedule_base, schedule_json, ref_code, calendar_events, truly_special
         FROM schedules WHERE date = ?;`
    ).get(date);
    return row ?? null;
}

export function getRange(startDate: string, endDate: string): ScheduleDayRow[] {
    return getDb().prepare<[string, string], ScheduleDayRow>(
        `SELECT date, regularity, special_schedule_name, special_schedule_h2,
                special_schedule_base, schedule_json, ref_code, calendar_events, truly_special
         FROM schedules WHERE date BETWEEN ? AND ? ORDER BY date;`
    ).all(startDate, endDate);
}

export function upsertDay(date: string, input: DayUpsertInput): ScheduleDayRow {
    getDb().prepare(
        `INSERT INTO schedules (date, regularity, special_schedule_name, special_schedule_h2,
                                special_schedule_base, schedule_json, ref_code, calendar_events, truly_special)
         VALUES (@date, @regularity, @special_schedule_name, @special_schedule_h2,
                 @special_schedule_base, @schedule_json, @ref_code, @calendar_events, @truly_special)
         ON CONFLICT(date) DO UPDATE SET
             regularity = excluded.regularity,
             special_schedule_name = excluded.special_schedule_name,
             special_schedule_h2 = excluded.special_schedule_h2,
             special_schedule_base = excluded.special_schedule_base,
             schedule_json = excluded.schedule_json,
             ref_code = excluded.ref_code,
             calendar_events = excluded.calendar_events,
             truly_special = excluded.truly_special;`
    ).run({
        date,
        regularity: input.regularity,
        special_schedule_name: input.special_schedule_name ?? null,
        special_schedule_h2: input.special_schedule_h2 ?? null,
        special_schedule_base: input.special_schedule_base ?? null,
        schedule_json: input.schedule_json ?? null,
        ref_code: input.ref_code ?? null,
        calendar_events: input.calendar_events ?? null,
        truly_special: input.truly_special ? 1 : 0,
    });
    return getDay(date)!;
}

export interface SpecialDaySummary {
    date: string;
    special_schedule_name: string | null;
    special_schedule_h2: string | null;
    special_schedule_base: string | null;
    schedule_json: string | null;
    truly_special: number;
}

export function listSpecialDays(): SpecialDaySummary[] {
    return getDb().prepare<[], SpecialDaySummary>(
        `SELECT MAX(date) AS date, special_schedule_name, special_schedule_h2,
                special_schedule_base, schedule_json, MAX(truly_special) AS truly_special
         FROM schedules
         WHERE regularity = 'special'
         GROUP BY special_schedule_name, schedule_json
         ORDER BY truly_special DESC, date DESC;`
    ).all();
}

export function deleteDay(date: string): boolean {
    const result = getDb().prepare(`DELETE FROM schedules WHERE date = ?;`).run(date);
    return result.changes > 0;
}

export interface TemplateRow {
    id: number;
    name: string;
    base: string | null;
    modifications_json: string | null;
    schedule_json: string;
}

export interface TemplateInput {
    name: string;
    base?: string | null;
    modifications_json?: string | null;
    schedule_json: string;
}

export function listTemplates(): TemplateRow[] {
    return getDb().prepare<[], TemplateRow>(
        `SELECT id, name, base, modifications_json, schedule_json FROM schedule_templates ORDER BY name;`
    ).all();
}

export function getTemplate(id: number): TemplateRow | null {
    const row = getDb().prepare<[number], TemplateRow>(
        `SELECT id, name, base, modifications_json, schedule_json FROM schedule_templates WHERE id = ?;`
    ).get(id);
    return row ?? null;
}

export function createTemplate(input: TemplateInput): TemplateRow {
    const result = getDb().prepare(
        `INSERT INTO schedule_templates (name, base, modifications_json, schedule_json)
         VALUES (@name, @base, @modifications_json, @schedule_json);`
    ).run({
        name: input.name,
        base: input.base ?? null,
        modifications_json: input.modifications_json ?? null,
        schedule_json: input.schedule_json,
    });
    return getTemplate(Number(result.lastInsertRowid))!;
}

export function updateTemplate(id: number, input: TemplateInput): TemplateRow | null {
    const result = getDb().prepare(
        `UPDATE schedule_templates
         SET name = @name, base = @base, modifications_json = @modifications_json, schedule_json = @schedule_json
         WHERE id = @id;`
    ).run({
        id,
        name: input.name,
        base: input.base ?? null,
        modifications_json: input.modifications_json ?? null,
        schedule_json: input.schedule_json,
    });
    return result.changes > 0 ? getTemplate(id) : null;
}

export function deleteTemplate(id: number): boolean {
    const result = getDb().prepare(`DELETE FROM schedule_templates WHERE id = ?;`).run(id);
    return result.changes > 0;
}

export interface RegularScheduleRow {
    regularity: string;
    name: string | null;
    schedule_json: string | null;
}

export function listRegularSchedules(): RegularScheduleRow[] {
    return getDb().prepare<[], RegularScheduleRow>(
        `SELECT regularity, name, schedule_json FROM regular_schedules;`
    ).all();
}

export function updateRegularSchedule(regularity: string, name: string | null, scheduleJson: string): boolean {
    const result = getDb().prepare(
        `UPDATE regular_schedules SET name = ?, schedule_json = ? WHERE regularity = ?;`
    ).run(name, scheduleJson, regularity);
    return result.changes > 0;
}
