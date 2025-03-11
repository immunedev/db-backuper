require('dotenv').config(); 

module.exports = {
    dbType: process.env.DB_TYPE || 'mysql', 
    backupDir: process.env.BACKUP_DIR || './backups', 

    
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'mydatabase',
    },

  
    postgresql: {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE || 'mydatabase',
        password: process.env.PG_PASSWORD || '',
        port: process.env.PG_PORT || 5432,
    },

  
      mongodb: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017', 
        database: process.env.MONGO_DATABASE || 'mydatabase',  
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      },

  
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Codziennie o 2:00 AM.  Zobacz https://crontab.guru/ dla innych opcji.

};