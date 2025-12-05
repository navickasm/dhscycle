CREATE TABLE schedules (
    date DATE PRIMARY KEY,
    regularity TEXT NOT NULL,
    special_schedule_name TEXT, -- This is also where no school reasons go
    special_schedule_h2 TEXT,
    special_schedule_base TEXT,
    schedule_json TEXT,
    ref_code INTEGER,
    CHECK (
            (regularity = 'special' AND special_schedule_name IS NOT NULL AND schedule_json IS NOT NULL AND special_schedule_base IN ('A', '16', '27', '38', '45', 'none'))
            OR
            (regularity = 'no' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL AND special_schedule_base IS NULL)
            OR
            (regularity IN ('s1finals', 's2finals') AND special_schedule_h2 IS NULL AND schedule_json IS NULL AND special_schedule_base IS NULL AND ref_code IS NOT NULL)
            OR
            (regularity IN ('A', '16', '27', '38', '45') AND special_schedule_name IS NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL AND special_schedule_base IS NULL)
        )
);