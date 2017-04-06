import setupBot from "./bot/bot"
import DB from "./persistence/db"
import * as assert from "assert";
import {Db} from "mongodb";
import {AlertsRepository} from "./alerts/alertsRepository";

require("dotenv").config();

async function startApp() {
    assert(process.env.MONGODB_URI, "Missing MongoDB connection URI (env: MONGODB_URI)");
    return await DB.connect(process.env.MONGODB_URI);
}

function wireBeans(db: Db) {
    return {
        db: db,
        alertsRepository: new AlertsRepository(db)
    };
}

startApp()
    .then(wireBeans)
    .then(setupBot)
    .catch(error => console.error(error));
