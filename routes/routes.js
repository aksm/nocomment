var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");
var mongoose = require("mongoose");


module.exports = function(app) {
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

  var Article = require("../models/articles.js");
  var Comment = require("../models/comments.js");

  app.get("/", function(req, res) {
    request("http://talkingpointsmemo.com/news", function(error, response, html) {
      var $ = cheerio.load(html);
      $("article.row").each(function(i, element) {
        // var title = element.children;
        var title = $(element).find("div.media-heading a").text();
        var byline = $(element).find("section.byline span.byline-content.is-right-padded").text();
        var date = $(element).find("section.byline span.byline-content time").attr("datetime");
        var teaser = $(element).find("section.teaser p:nth-child(2)").text();
        var image = $(element).find("img.media-object").attr("src");
        var url = $(element).find("a.read-more").attr("href");
        // console.log("Title: "+ title);
        // console.log("Teaser: "+teaser);
        // console.log("Author: "+byline);
        // console.log("Date: "+date);
        // console.log("Image: "+image);
        // console.log("URL: "+url);
        var article = {
          "heading": title,
          "byline": byline,
          "date": date,
          "teaser": teaser,
          "image": image,
          "url": url
        };
        // var newArticle = new Article(article);
        Article.update({url: article.url},article, {upsert: true},function(error, doc) {
          if(error) console.log(error);
          else
          {
            Comment.findOneAndUpdate({}, {$push: {"articles": doc._id}}, {new: true}, function(error, doc) {
              if(error) console.log(error);
              // else res.send(doc);
            });
          }

        });


        
        // request(url, function(error, response, html) {
        //   var $ = cheerio.load(html);
          // var story = $("div.story-body").text();
          // console.log(story);
        // });
      });
    });
    Article.find({})
      .sort({date: -1})
      .populate("comments")
      .exec(function(error, doc) {
        if(error) res.send(error);
        else {
          console.log(doc);
          res.render("index", {
            "article": doc
          });
        }
      });


  });
  app.post("/comment", function(req, res) {
    // console.log(req.body);
    var newComment = new Comment({
      commenter: req.body.commenter,
      comment: req.body.comment
    });
    newComment.save(function(err, doc) {
      if(err) res.send(err);
      else {
        var articleID = mongoose.Types.ObjectId(req.body.articleID);
        Article.findOneAndUpdate(
          {_id: articleID},
          {$push: {"comments": doc._id}},
          {new: true},
          function(err, doc) {
            if(err) res.send(err);
            else {
              res.send(200);
            }
          });
      }
    });
  });

};