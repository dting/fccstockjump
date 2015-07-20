'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String, info: Array, active: Boolean
});

module.exports = mongoose.model('Thing', ThingSchema);
