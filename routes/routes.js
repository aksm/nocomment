var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");
var mongoose = require("mongoose");


module.exports = function(app) {

  // Add handlebars helper for formatting dates
  var hbs = exphbs.create({
    helpers: {
      dateFormat: require("handlebars-dateformat")
    },
    defaultLayout: "main"
  });

  app.set("views");
  app.engine("handlebars", hbs.engine);
  app.set("view engine", "handlebars");

  app.use(methodOverride('_method'));

  // Import mongoose models
  var Article = require("../models/articles.js");
  var Comment = require("../models/comments.js");

  // Route to render page
  app.get("/", function(req, res) {

    // Scrape site for news
    request("http://talkingpointsmemo.com/news", function(error, response, html) {
      var $ = cheerio.load(html);

      // Loop through each article on site
      $("article.row").each(function(i, element) {
        var title = $(element).find("div.media-heading a").text();
        var byline = $(element).find("section.byline span.byline-content.is-right-padded").text();
        var date = $(element).find("section.byline span.byline-content time").attr("datetime");
        var teaser = $(element).find("section.teaser p:nth-child(2)").text();
        var image = $(element).find("img.media-object").attr("src");
        var url = $(element).find("a.read-more").attr("href");

        // Create article object
        var article = {
          "heading": title,
          "byline": byline,
          "date": date,
          "teaser": teaser,
          "image": image,
          "url": url
        };

        // Add or update article in mongo
        Article.update({url: article.url}, article, {upsert: true},function(error, doc) {
          if(error) console.log(error);
          else
          {
            // Set up comment array to populate comments
            Comment.findOneAndUpdate({}, {$push: {"articles": doc._id}}, {new: true}, function(error, doc) {
              if(error) console.log(error);
            });
          }

        });

      });
    });

    // Retrieve articles and populate any comments
    Article.find({})
      .sort({date: -1})
      .populate("comments")
      .exec(function(error, doc) {
        if(error) res.send(error);
        else {
          // console.log(doc);

          // Render page with articles from mongo
          res.render("index", {
            "article": doc
          });
        }
      });


  });

  // Route to post comments
  app.post("/comment", function(req, res) {

    // Create comment object from user's post
    var newComment = new Comment({
      commenter: req.body.commenter,
      comment: req.body.comment
    });

    // Save it to mongo
    newComment.save(function(err, doc) {
      if(err) res.send(err);
      else {
        // Create object id with article id passed from user's post
        var articleID = mongoose.Types.ObjectId(req.body.articleID);

        // Push comment id into appropriate article's array of comments
        Article.findOneAndUpdate(
          {_id: articleID},
          {$push: {"comments": doc._id}},
          {new: true},
          function(err, doc) {
            if(err) res.send(err);
            else {
              res.redirect("/");
            }
          });
      }
    });
  });

  // Route for users to flag comments
  app.get("/flag/:type?/:id?", function(req, res) {
    var commentID = mongoose.Types.ObjectId(req.params.id);

    // Create flag object to pass in type
    var flag = {};
    // Pass in flag type from user.
    flag[req.params.type] = 1;

    // Increment counter for appropriate flag.
    Comment.findOneAndUpdate(
      {_id: commentID},
      {$inc: flag},
      function(err, doc){
        if(err) res.send(err);
        else {
          res.redirect("/");
        }

      });
  });

};