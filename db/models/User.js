const mongoose = require("mongoose");

const {Schema} = mongoose;

const userSchema = new Schema({
  username: { 
    required: true, 
    type: String 
  }
});

module.exports = mongoose.model( 'User', userSchema );