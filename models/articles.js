var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  heading: {
    type: String
  },
  byline: {
    type: String
  },
  date: {
    type: Date
  },
  teaser: {
    type: String
  },
  image: {
    type: String
  },
  url: {
    type: String,
    unique: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]

});

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;