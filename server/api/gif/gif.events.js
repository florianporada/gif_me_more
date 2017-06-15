/**
 * Gif model events
 */

'use strict';

import {EventEmitter} from 'events';
var GifEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
GifEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Gif) {
  for(var e in events) {
    let event = events[e];
    Gif.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    GifEvents.emit(`${event}:${doc._id}`, doc);
    GifEvents.emit(event, doc);
  };
}

export {registerEvents};
export default GifEvents;
