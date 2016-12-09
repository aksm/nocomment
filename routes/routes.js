var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");


module.exports = function(app) {
  app.set("views");
  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
  app.set("view engine", "handlebars");

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
    Article.find({}).sort({date: -1}).exec(function(error, doc) {
      if(error) res.send(error);
      else {
        // console.log(doc);
        res.render("index", {
          "article": doc
        });
      }
    });


  });
  // app.get("/api/news/all", function(req, res) {
  //   Article.find({}, function(error, doc) {
  //     if(error) res.send(error);
  //     else res.send(doc);
  //   });

  // });

};