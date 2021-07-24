const express = require("express"),
  mongoose = require("mongoose"),
  exerciseTracker = express.Router(),
  bodyParser = require("body-parser"),
  Exercise = require("../db/models/Exercise"),
  User = require("../db/models/User");

const uri =
  "mongodb+srv://user1:sfIfe231CK@cluster0.bghm0.mongodb.net/exercise_tracker?retryWrites=true&w=majority";

// Connect mongoose to MongoDB database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "cnnection error:"));
db.once("open", () => {
  console.log("connection to db - successful");
});

// Connect body parser
exerciseTracker.use(bodyParser.urlencoded({ extended: true }));
exerciseTracker.use(bodyParser.json());

exerciseTracker.get("/", (req, res) => {
  console.log(`sending GET request to ${req.baseUrl}`);
  User.find({})
    .where("username")
    .select("username _id")
    .exec((err, doc) => {
      if (err) {
        console.log(`faild to find any document by ${username} key: ${err}`);
      }
      console.log(`return array of documents`);
      res.json(doc);
    });
});

exerciseTracker.post("/", (req, res) => {
  let userName = req.body.username;
  console.log(`sending POST request to ${req.baseUrl}`);
  console.log(`saving to db ${userName} - user's name`);
  User.create({ username: `${userName}` }, (err, doc) => {
    if (err) {
      console.log(`unable to save documnet to db: ${err}`);
    }
    console.log(`user with username: ${userName} - successfuly saved to db`);
    console.log(`that what is saved to db: ${doc}`);
    res.json({ username: userName, _id: doc._id });
  });
});

exerciseTracker.post("/:_id/exercise", (req, res) => {
  console.log(`sending POST request to ${req.baseUrl}`);
});

module.exports = exerciseTracker;
