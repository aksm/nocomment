var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  subject: {
    type: String
  },
  username: {
    type: String,
    trim: true
  },
  comment: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }

});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;