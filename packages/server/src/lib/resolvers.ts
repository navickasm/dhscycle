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
        this.db = new Sequelize(process.env.DATABASE_URL);
        this.db.addModels([ScheduleModel]);
        this.inited = false;
    }
}