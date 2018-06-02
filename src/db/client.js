const { aql } = require('arangojs');
const serializers = require('../serializers');

class DatabaseClient {
    constructor(db, collection) {
        this.db = db;
        this.collection = collection;
    }

    async healthcheck() {
        this.collection.get();
    }

    async saveResult(sanitizedBody) {
        await this.collection.save(sanitizedBody);
    }

    async generateReport(query, isSummarized) {
        const summaryCursor = await this.db.query(aql`
            FOR r IN ${this.collection}
            FILTER r.url == ${query.url}
                AND r.utctime >= ${query.starttime}
                AND r.utctime <= ${query.endtime}
            COLLECT status = r.status WITH COUNT INTO count
            RETURN { status, count }
        `);
        const summary = await summaryCursor.reduce((prevObj, item) => {
            return {
                ...prevObj,
                [item.status]: item.count,
            };
        }, {});

        let results;
        if (!isSummarized) {
            const resultsCursor = await this.db.query(aql`
                FOR r IN ${this.collection}
                FILTER r.url == ${query.url}
                    AND r.utctime >= ${query.starttime}
                    AND r.utctime <= ${query.endtime}
                RETURN r
            `);
            results = await resultsCursor.map(value => serializers.serializeResult(value));
        }
        return {
            summary: summary || {},
            results: results || [],
        };
    }
}

module.exports.DatabaseClient = DatabaseClient;
