/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var thing = require('./thing.model');

function onSave(socket, doc) {
  socket.emit('thing:save', doc);
}

function onRemove(socket, doc) {
  socket.emit('thing:remove', doc);
}

exports.register = function(socket) {
  thing.schema.post('save', function(doc) {
    onSave(socket, doc);
  });

  thing.schema.post('remove', function(doc) {
    onRemove(socket, doc);
  });
};
