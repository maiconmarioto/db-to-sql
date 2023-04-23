const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  dbType: process.env.DB_TYPE,
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA
  },
};
