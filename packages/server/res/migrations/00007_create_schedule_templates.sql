CREATE TABLE IF NOT EXISTS schedule_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base TEXT CHECK (base IN ('A', '16', '27', '38', '45', 'none')),
    modifications_json TEXT,
    schedule_json TEXT NOT NULL
);
