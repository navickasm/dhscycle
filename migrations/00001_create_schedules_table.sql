CREATE TYPE r_enum AS ENUM ('Anchor', '16', '27', '38', '45', 'special');

CREATE TABLE schedules (
                           date DATE PRIMARY KEY,
                           is_regular r_enum NOT NULL,
                           special_schedule_name TEXT,
                           special_schedule_h2 TEXT,
                           schedule_json JSONB
);

ALTER TABLE schedules
    ADD CONSTRAINT check_schedule_type_data
        CHECK (
            (is_regular = 'regular' AND special_schedule_name IS NULL AND special_schedule_h2 IS NULL AND schedule_json IS NULL) OR
            (is_regular = 'special' AND special_schedule_name IS NOT NULL AND special_schedule_h2 IS NOT NULL AND schedule_json IS NOT NULL)
            );