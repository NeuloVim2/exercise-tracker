const mongoose = require("mongoose");

const { Schema } = mongoose;

const exerciseSchema = new Schema({

  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    set: (d) => d === undefined ? new Date().toDateString() : d
  }
});

module.exports = mongoose.model("Exercise", exerciseSchema);
