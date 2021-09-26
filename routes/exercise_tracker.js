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
      console.log(`return array of documents`);
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
    console.log(`user with username: ${userName} - successfuly saved to db`);
    console.log(`that what is saved to db: ${doc}`);
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

    console.log(`created new document ${exer}`);
    console.log(`type of exer.duration: ${typeof exer.duration}`)

    User.findOneAndUpdate({ _id: _id }, { $push: {log: exer._id} }, {new: true})
      .exec((err, user) => {
        if (err) {
          console.log(
            `unable to create and return document, got such error: ${err}`
          );
          res.send("Unknown user id");
        }

        console.log("user document", user);

        console.log(`user.log value AFTER PUSH: ${user.log}`);

        console.log(`value of exercisesInfo.date AFTER assignment: ${verifyedDate}`);

        const username = user.username;

        res.status(200).json({ _id, username, date: exer.date, duration, description });
      })

  })
});

exerciseTracker.get("/:_id/logs", (req, res) => {
  let userId = req.params._id;
  console.log(`user id: ${userId}`);
  User.findById(userId)
    .populate("log")
    .select("-__v")
    .exec()
    .then((user) => {
      const count = user.log.length;
      let log = user.log.map((el) => {
        return { 
          duration: el.duration, 
          description: el.description, 
          date: el.date
        }
      })
      res.status(200).json({username: user.username, _id: user._id, log: log, count: count});
    })
    .catch((err) => {
      res.status(400).json(`Unable to find user an got such error: ${err}`);
    })
})

module.exports = exerciseTracker;
