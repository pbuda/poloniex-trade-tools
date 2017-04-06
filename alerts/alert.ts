import Rate from "../support/Rate";
import {ObjectID} from "bson";

export default class Alert {
    static create():Alert {
        return
    }

    constructor(public id: ObjectID, public source: String, public crypto: String, public rate: Rate) {
    }

    toObject(): any {
        return {_id: this.id, source: this.source, crypto: this.crypto, rate: this.rate.value}
    }

    static fromObject(record: any): Alert {
        return new Alert(record._id, record.source, record.crypto, new Rate(record.rate))
    }
}