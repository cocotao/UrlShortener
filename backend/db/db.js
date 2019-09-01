

var mongoose = require('mongoose');
var dbConnectConfig = require('../db/config');
var DB_URL = (process.env.NODE_ENV === 'production') ? dbConnectConfig.production : dbConnectConfig.development;
DB_URL = (process.env.NODE_ENV === 'test') ? dbConnectConfig.test : dbConnectConfig.development;

const options = {
  autoIndex: false, // Don't build indexes
  autoReconnect: true, // Never set false unless you are an expert to manage connect pool
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true
};

/* Connect */
mongoose.connect(DB_URL, options);

/* Connect success */
mongoose.connection.on('connected', function() {
  console.log('Mongoose connection open to ' + DB_URL);
});

/* Connect error */
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error:' + err);
});

/* Connect disconnect */
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose connection disconnected');
});

module.exports = mongoose;



