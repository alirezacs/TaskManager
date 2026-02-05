const knex = require('knex');
const config = require('../config');

const db = knex({
  client: 'mysql2',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name
  },
  pool: { min: 2, max: 10 }
});

module.exports = db;
