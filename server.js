const exerciseTracker = require("./routes/exercise_tracker.js");
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())

app.use("/api/users", exerciseTracker );

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}. Address to access: http://localhost:${listener.address().port}`)
})
