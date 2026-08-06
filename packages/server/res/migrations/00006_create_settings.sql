CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('school_year_start', '2025-08-14'),
    ('school_year_end', '2026-06-04'),
    ('school_year_label', '2025-2026'),
    ('passing_period_minutes', '5');
