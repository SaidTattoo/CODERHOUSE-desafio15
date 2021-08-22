const knef = require('knex')
const knexFile = require('./knexfile')
const { NODE_ENV } =  require('../config/globals')

const db = knef(knexFile[NODE_ENV])
module.exports = db