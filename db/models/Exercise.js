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
    type: Date,
    default: Date.now,
  },
  user: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "User"
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
