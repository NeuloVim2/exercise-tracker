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
  console.log(`sending POST request to ${req.baseUrl}${req.url}`);
  User.find({})
    .where("username")
    .select("username _id")
    .exec((err, doc) => {
      if (err) {
        console.log(`faild to find any document by ${username} key: ${err}`);
      }
      res.json(doc);
    });
});

exerciseTracker.post("/", (req, res) => {
  let userName = req.body.username;
  console.log(`sending POST request to ${req.baseUrl}${req.url}`);
  console.log(`saving to db ${userName} - user's name`);
  User.create({ username: `${userName}` }, (err, doc) => {
    if (err) {
      console.log(`unable to save documnet to db: ${err}`);
    }
    res.json({ username: userName, _id: doc._id });
  });
});

exerciseTracker.post("/:_id/exercises", (req, res) => {
  console.log(`sending POST request to ${req.baseUrl}${req.url}`);
  const _id = req.params._id;
  const { duration, description, date } = req.body;

  let verifyedDate = date ? new Date(date).toDateString() : undefined;

  Exercise.create({ duration, description, date: verifyedDate }, (err, exer) => {
    if (err) {
      console.log(`unable to save documnet to db: ${err}`);
    }


    User.findOneAndUpdate({ _id: _id }, { $push: { log: exer._id } }, { new: true })
      .exec((err, user) => {
        if (err) {
          console.log(
            `unable to create and return document, got such error: ${err}`
          );
          res.send("Unknown user id");
        }

        const username = user.username;

        res.status(200).json({ _id, username, date: exer.date, duration: exer.duration, description });
      })

  })
});

exerciseTracker.get("/:_id/logs", async (req, res) => {
  let userId = req.params._id;
  console.log(`user id: ${userId}`);

  User.findById(userId)
    .select("-__v")
    .populate({
      path: "log",
      select: "duration description date"
    })
    .exec()
    .then((user) => {
    
      // get values from url
      let limit = req.query.limit || user.log.length;
      let from = req.query.from || "";
      let to = req.query.to || "";

      console.log(`User doc: ${user}`);

      let response = user;

      response.log = user.log.slice(0, limit);

      if (from || to) {
        if (!from) {
          console.log(`in from`)
          from = new Date();
        }
        if (!to) {
          console.log(`in to`)
          to = new Date();
        }
        response.log = response.log.filter(el => new Date(el.date) >= new Date(from) && new Date(el.date) <= new Date(to))
      }
      const count = response.log.length;
      res.status(200).json({ username: response.username, _id: response._id, log: response.log, count: count });
    })
    .catch((err) => {
      res.status(400).json(`Unable to find user an got such error: ${err}`);
    })
})

module.exports = exerciseTracker;
