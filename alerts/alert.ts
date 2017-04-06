import Rate from "../support/Rate";
import {ObjectID} from "bson";

export default class Alert {
    constructor(public id: ObjectID, public source: String, public crypto: String, public rate: Rate, public channelId: String) {
    }

    toObject(): any {
        return {_id: this.id, source: this.source, crypto: this.crypto, rate: this.rate.value, channelId: this.channelId}
    }

    static fromObject(record: any): Alert {
        return new Alert(record._id, record.source, record.crypto, new Rate(record.rate), record.channelId)
    }
}