const knex = require('knex');
const config = require('../config');

const db = knex(config);

module.exports = db;
