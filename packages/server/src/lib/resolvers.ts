import {Sequelize} from "sequelize-typescript";
import {ScheduleModel} from "./models/scheduleModel.js";

export class GraphQLResolvers {
    db!: Sequelize;
    inited!: boolean;

    async query() {

    }

    async init() {
        if (this.inited) return;
        this.inited = true;
        await this.db.authenticate();
        await this.db.sync();
        return this;
    }

    constructor() {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not defined");
        }
        this.db = new Sequelize(process.env.DATABASE_URL);
        this.db.addModels([ScheduleModel]);
        this.inited = false;
    }
}