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
  let id = req.params._id;
  let exercisesInfo =
    req.body.date === undefined || req.body.date === null || req.body.date === ""
      ? {
        description: req.body.description,
        duration: req.body.duration,
      }
      : {
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
      };

  console.log(`object which send to findOneAndUpdate(): ${typeof exercisesInfo.date}`);
  User.findById(id)
    .populate("log")
    .select("-_v")
    .exec((err, user) => {
      if (err) {
        console.log(
          `unable to create and return document, got such error: ${err}`
        );
        res.send("Unknown user id");
      }

      let exerciseExist = isExerciseExist(user, exercisesInfo)

      console.log(`exercise exist? - ${exerciseExist}`);

      if (!isExerciseExist(user, exercisesInfo)) {
        Exercise.create(exercisesInfo, (err, exer) => {
          if (err) {
            console.log(`unable to save documnet to db: ${err}`);
          }

          console.log(`created new document ${exer}`);
          const { _id, username } = user,
            { description, duration } = exer;
          let date = new Date(exer.date).toUTCString().split(" ");
          date = `${date[0].split(",")[0]} ${date[2]} ${date[1]} ${date[3]}`;
          user.log.push(exer._id);
          res.json({ _id, username, date, duration, description });

        })
      }

      if (exerciseExist) res.json("exercise exist") 
    });
});

exerciseTracker.get("/:_id/logs", (req, res) => {
  let userId = req.params._id;
  console.log(`user id: ${userId}`);
  Exercise.find({ user: userId })
    .populate("user")
    .select("-_id -__v")
    .exec((err, doc) => {
      console.log(`accessing document ${doc}`)
      if (err) console.log(`unable to find exercise with user: ${userId}. return error ${error}`);


      // get user document info
      const { _id, username } = doc[0].user,

        // get number of exercises for user
        count = doc.length;

      res.json({
        username, _id, count: count, log: doc.map((document) => {
          let newDoc = {};
          Object.entries(document._doc).forEach((key) => key === "description" || "duration" || "date"
            ? newDoc[key] = document[key]
            // ? console.log(key)
            : false
          )
          return newDoc
        })
      })
      // res.json(doc)

    })
})

// params[user: UserModel, exercise: ExerciseInfo]
const isExerciseExist = (user, exercise) => {
  console.log(`in isExerciseExist()`);
  console.log(`user ${user}`);
  // user.log[n] is not empty
  return user.log.length > 0
  
  // get execise from user.log[n] 
  ? user.log.some( exer => {
    console.log(`Object entries ${Object.entries(exer)}`);
  })

  : false;
}

module.exports = exerciseTracker;
