import {Collection, Db} from "mongodb";
import Alert from "./alert";
import {ObjectID} from "bson";
import Rate from "../support/Rate";

export class AlertsRepository {
    coll: Collection;

    constructor(db: Db) {
        this.coll = db.collection("alerts");
    }

    async findAll(): Promise<Alert[]> {
        let found: any[] = await this.coll.find().toArray();
        return found.map(Alert.fromObject);
    }

    async save(alert: Alert): Promise<any> {
        await this.coll.updateOne({_id: alert.id}, alert.toObject(), {upsert: true});
        return alert;
    }

    async createNew(source: String, crypto: String, rate: Rate, channelId: String): Promise<Alert> {
        let alert = new Alert(new ObjectID(), source, crypto, rate, channelId);
        return await this.save(alert);
    }

    async delete(alert: Alert): Promise<void> {
        await this.coll.deleteOne({_id: alert.id})
    }
}