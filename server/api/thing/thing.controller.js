/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var yahooFinance = require('yahoo-finance');

// Get list of things
exports.index = function(req, res) {
  Thing.find(function(err, things) {
    if (err) return handleError(res, err);
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function(err, thing) {
    if (err) return handleError(res, err);
    if (!thing) return res.send(404);
    return res.json(thing);
  });
};

function formattedDateString(date) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()].join('-');
}

function addMonths(date, months) {
  var newDate = new Date(date.valueOf());
  newDate.setMonth(date.getMonth() + months);
  return newDate;
}

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.findOne({name: req.body.name}, function(err, thing) {
    if (err) return handle(res, err);
    // Thing already exists.
    console.log(err);
    console.log(thing);
    if (thing) res.status(403).send('Symbol already exists.');
    lookupSymbol(req, res).then(function(quotes) {
      if (!quotes[0]) return res.status(403).send('Invalid stock symbol.');
      Thing.create({name: req.body.name, info:quotes}, function(err, thing) {
        if (err) return handleError(res, err);
        res.send(200);
      });
    });
  });
};

function lookupSymbol(req) {
  var end = new Date();
  var start = addMonths(end, -6);
  return yahooFinance.historical({
    symbol: req.body.name,
    from: start,
    to: end,
    period: 'd'
  });
}

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if (req.body._id) delete req.body._id;
  Thing.findById(req.params.id, function(err, thing) {
    if (err) return handleError(res, err);
    if (!thing) return res.send(404);
    var updated = _.merge(thing, req.body);
    updated.save(function(err) {
      if (err) return handleError(res, err);
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function(err, thing) {
    if (err) return handleError(res, err);
    if (!thing) return res.send(404);
    thing.remove(function(err) {
      if (err) return handleError(res, err);
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
