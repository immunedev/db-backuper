const cron = require('node-cron');
const fs = require('fs');
const config = require('./config');
const mysqldump = require('mysqldump').default;
const { Client } = require('pg');
const { MongoClient } = require('mongodb');




async function backupMysql() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.backupDir}/mysql-${config.mysql.database}-${timestamp}.sql.gz`;

    try {
        await mysqldump({
            connection: config.mysql,
            dumpToFile: filename,
            compressFile: true, 
        });
        console.log(`MySQL backup created: ${filename}`);
    } catch (err) {
        console.error('MySQL backup error:', err);
    }
}


async function backupPostgresql() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.backupDir}/postgresql-${config.postgresql.database}-${timestamp}.sql`;
    const pgClient = new Client(config.postgresql);

    try {
        await pgClient.connect();
        const stream = pgClient.query(`COPY (SELECT * FROM your_table) TO STDOUT WITH (FORMAT csv)`); 

        const fileStream = fs.createWriteStream(filename);
        stream.pipe(fileStream);

        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
            stream.on('error', reject);

        });

        console.log(`PostgreSQL backup created: ${filename}`);
        await pgClient.end();
    } catch (err) {
        console.error('PostgreSQL backup error:', err);
        await pgClient.end();
    }
}



async function backupMongodb() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.backupDir}/mongodb-${config.mongodb.database}-${timestamp}`;
    const client = new MongoClient(config.mongodb.uri, config.mongodb.options);

    try {
        await client.connect();
        const db = client.db(config.mongodb.database);
        const collections = await db.listCollections().toArray();


        if (!fs.existsSync(filename)) {
          fs.mkdirSync(filename, { recursive: true });
        }

        for (const collectionInfo of collections) {
          const collectionName = collectionInfo.name;
          const collection = db.collection(collectionName);
          const documents = await collection.find({}).toArray();


          fs.writeFileSync(`${filename}/${collectionName}.json`, JSON.stringify(documents, null, 2));
        }

        console.log(`MongoDB backup created: ${filename}`);
    } catch (err) {
        console.error('MongoDB backup error:', err);
    } finally {
        await client.close();
    }
}




async function performBackup() {
    console.log('Starting database backup...');


    if (!fs.existsSync(config.backupDir)) {
        fs.mkdirSync(config.backupDir);
    }

    switch (config.dbType) {
        case 'mysql':
            await backupMysql();
            break;
        case 'postgresql':
            await backupPostgresql();
            break;
        case 'mongodb':
            await backupMongodb();
            break;
        default:
            console.error('Unsupported database type:', config.dbType);
    }
}



cron.schedule(config.schedule, () => {
    performBackup();
});


performBackup();

console.log(`Backup script started.  Scheduled to run: ${config.schedule}`);