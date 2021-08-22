const knex = require('knex');
const knexFile = require('./knexfile')
const { NODE_ENV } =  require('../config/globals')



const db = knex(knexFile[NODE_ENV])
module.exports = db