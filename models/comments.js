var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  commenter: {
    type: String,
    trim: true
  },
  comment: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  inappropriate: {
    type: Number,
    default: 0
  },
  spam: {
    type: Number,
    default: 0
  }

});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;