var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const passport = require("passport");

const connectToDatabase = require("./utils/db");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.set("bufferCommands", false); // 💡 prevent buffering when disconnected

var index = require("./routes/index");
var users = require("./routes/users");
var cases = require("./routes/caseRouter");
var people = require("./routes/peopleRouter");
var email = require("./routes/sendMessageRoute");

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://deathstar606.github.io/Digix",
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      console.log("allowed origin: ", origin);
      callback(null, true);
    } else {
      console.log("denied origin: ", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow sending cookies and other credentials with the request
  optionsSuccessStatus: 200, // Set the successful response status code for preflight requests
};

var app = express();

app.use(cors(corsOptions));

app.use(passport.initialize());

app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Connect to DB once during startup
connectToDatabase()
  .then(() => {
    console.log("✅ Database connected successfully");

    // Only load routes AFTER DB connection
    app.use("/", index);
    app.use("/users", users);
    app.use("/cases", cases);
    app.use("/people", people);
    app.use("/send-mail", email);

    const http = require("http");
    const server = http.createServer(app);
    server.listen(process.env.PORT || 9000, () => {
      console.log("🚀 Server running on port", process.env.PORT || 9000);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1); // Stop the app if DB fails
  });

module.exports = app;
