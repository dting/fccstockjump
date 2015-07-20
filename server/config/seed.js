/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');

Thing.find({}).remove(function() {
  Thing.create({name: 'APPL', info: 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'});
});
