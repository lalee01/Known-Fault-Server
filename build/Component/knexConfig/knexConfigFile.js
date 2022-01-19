import 'dotenv/config';
;
const defaults = {
    client: 'mysql',
    connection: {
        host: 'DB_HOST',
        user: 'DB_USER',
        password: 'DB_PASSWORD',
        database: 'DB_DATABASE'
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};
const knexConfig = {
    local: {
        client: 'mysql',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        }
    },
    development: Object.assign(Object.assign({}, defaults), { debug: true, useNullAsDefault: true }),
    production: Object.assign({}, defaults)
};
export default knexConfig;
