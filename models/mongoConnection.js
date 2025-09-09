const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coffeUsers';

let client;
let db;

async function connectMongo() {
    if (db) return db;
    client = new MongoClient(MONGO_URI, { 
        useUnifiedTopology: true 
    });
    await client.connect();
    // If the URI contains the db name, use that; otherwise default to coffeUsers
    const dbNameFromUri = (() => {
        try {
            const u = new URL(MONGO_URI);
            const pathname = u.pathname.replace(/^\//, '');
            return pathname || 'coffeUsers';
        } catch {
            return 'coffeUsers';
        }
    })();
    db = client.db(dbNameFromUri);
    return db;
}

function getDb() {
    if (!db) {
        throw new Error('MongoDB not connected. Call connectMongo() first.');
    }
    return db;
}

async function closeMongo() {
    if (client) {
        await client.close();
        client = undefined;
        db = undefined;
    }
}

module.exports = {
    connectMongo,
    getDb,
    closeMongo
};


