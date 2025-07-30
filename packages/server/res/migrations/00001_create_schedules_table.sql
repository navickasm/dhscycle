CREATE TABLE schedules (
    date DATE PRIMARY KEY,
    regularity TEXT NOT NULL CHECK (regularity IN ('A', '16', '27', '38', '45', 'special')),
    special_schedule_name TEXT,
    special_schedule_h2 TEXT,
    schedule_json TEXT,
    CHECK (
        (regularity = 'special' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NOT NULL AND schedule_json IS NOT NULL)
            OR
        (regularity <> 'special' AND special_schedule_name IS NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL)
        )
);