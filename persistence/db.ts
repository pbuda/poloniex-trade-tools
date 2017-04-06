import {MongoClient} from "mongodb"

const DB = {
    async connect(url) {
        return await MongoClient.connect(url);
    },
    close(db) {
        db.close();
    }
};

export default DB;