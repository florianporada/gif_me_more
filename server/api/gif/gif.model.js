'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './gif.events';

var GifSchema = new mongoose.Schema({
  name: String,
  uuid: String,
  gif: Object,
  associatedTrend: String,
});

registerEvents(GifSchema);
export default mongoose.model('Gif', GifSchema);
