var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var roomSchema = new Schema({
  roomtitle: String,
  price: Number,
  description: String,
  location: String,
  roomphoto: {
    type: [String],
    default: undefined,
  },
  ownername: String,
  owneremail: String,
});

module.exports = mongoose.model('Rooms', roomSchema);
