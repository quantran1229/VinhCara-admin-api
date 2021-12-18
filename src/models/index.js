import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import Constant from '../constants';
import Logger from '../utils/logger';

const basename = path.basename(__filename);
let dbConfig = Constant.instance.DATABASE_CONFIG;
const db = {};

// Initial database
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging ? Logger.sql.bind(this) : false,
  dialectOptions: {
    useUTC: false
  },
  timezone: "+07:00",
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
sequelize.authenticate().then(() => {
  Logger.info('Connection has been established successfully.');
}).catch(e => Logger.error('Unable to connect to the database:', e));

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;