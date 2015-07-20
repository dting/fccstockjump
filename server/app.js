/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Thing = require('./api/thing/thing.model');
var _ = require('lodash');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

new CronJob({
  cronTime: '0 0 0 * * *', onTick: function() {
    Thing.find({}, function(err, things) {
      console.log(things);
      if (things.length) {
        _.invoke(things, 'remove');
      }
    });
  }, start: true, timeZone: 'America/Los_Angeles'
});

// Start server
server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port,
    app.get('env'));
});

// Expose app
exports = module.exports = app;
