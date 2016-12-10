var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var Promise = require("bluebird");

mongoose.Promise = Promise;

// Comment out for deployment
// var dotenv = require("dotenv");
// dotenv.load();

// Set port
app.set("port", process.env.PORT || 8080);

// Set static
app.use("/public", express.static("public"));

// Sets up the Express app to handle data parsing 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:"application/vnd.api+json"}));


// Mongoose connection
mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;

// Log any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Log a success message when we connect to our mongoDB collection with no issues
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// =============================================================
require("./routes/routes.js")(app);

// Listener
// =============================================================

app.listen(app.get("port"), function() {console.log("Hollaback on port: "+app.get("port"));});