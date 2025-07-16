CREATE TABLE schedules (
    date DATE PRIMARY KEY,
    regularity TEXT NOT NULL CHECK (regularity IN ('A', '16', '27', '38', '45', 'special')),
    special_schedule_name TEXT,
    special_schedule_h2 TEXT,
    schedule_json TEXT
);