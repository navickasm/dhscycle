import { Table, Column, Model, DataType } from 'sequelize-typescript';
import type {Schedule} from "../../../../common/types/schedule.ts";

export type R_Enum = 'A' | '16' | '27' | '38' | '45' | 'special';

@Table({
    tableName: 'schedules',
    timestamps: false,
})
export class ScheduleModel extends Model<ScheduleModel> {
    @Column({
        type: DataType.DATEONLY,
        primaryKey: true,
        allowNull: false,
    })
    date!: Date;

    @Column({
        type: DataType.ENUM('A', '16', '27', '38', '45', 'special'),
        allowNull: false,
    })
    is_regular!: R_Enum;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    special_schedule_name?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    special_schedule_h2?: string;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    schedule_json?: Schedule; // or any specific interface for your JSON structure
}
