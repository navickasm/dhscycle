CREATE TYPE app_public.r_enum AS ENUM ('A', '16', '27', '38', '45', 'special');

CREATE TABLE app_public.schedules (
    date DATE PRIMARY KEY,
    regularity app_public.r_enum NOT NULL,
    special_schedule_name TEXT,
    special_schedule_h2 TEXT,
    schedule_json JSONB
);

ALTER TABLE app_public.schedules
    ADD CONSTRAINT check_schedule_type_data
    CHECK (
        (regularity != 'special' AND special_schedule_name IS NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL) OR
        (regularity = 'special' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NOT NULL AND schedule_json IS NOT NULL)
    );