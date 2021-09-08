const mongoose = require("mongoose");

const {Schema} = mongoose;

const userSchema = new Schema({
  username: { 
    required: true, 
    type: String 
  },

  log: [{
    type: Schema.Types.ObjectId,
    ref: "Exercise"
  }]
});

module.exports = mongoose.model( 'User', userSchema );