CREATE TABLE schedules (
    date DATE PRIMARY KEY,
    regularity TEXT NOT NULL CHECK (regularity IN ('A', '16', '27', '38', '45', 'special', 'no')),
    special_schedule_name TEXT, -- This is also where no school reasons go
    special_schedule_h2 TEXT,
    special_schedule_base TEXT,
    schedule_json TEXT,
    CHECK (
            (regularity = 'special' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NOT NULL AND schedule_json IS NOT NULL AND special_schedule_base IN ('A', '16', '27', '38', '45', 'none'))
            OR
            (regularity = 'no' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL AND special_schedule_base IS NULL)
            OR
            (regularity NOT IN ('special', 'no') AND special_schedule_name IS NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL AND special_schedule_base IS NULL)
        )
);