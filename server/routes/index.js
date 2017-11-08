"use strict";

let config = require("../config");
let logger = require("../core/logger");
let path = require("path");

module.exports = function(app, db) {
  // Index page
  app.get("/", function(req, res) {
    if (req.user != null)
      res.render("main", {
        user: req.user
      });
    else res.render("index");
  });

  // Index page
  app.get("/admin", function(req, res) {
    res.render("admin");
  });

  // Handle health check routes
  require("./health")(app, db);

  // Handle sitemap routes
  require("./sitemap")(app, db);

  // Handle account routes
  require("./account")(app, db);

  // Handle Auth routes
  require("./auth")(app, db);

  // Load services routes
  //require("../applogic/routeHandlers")(app, db);
  let serviceLoader = require("../services/serviceLoader");
  serviceLoader.registerRoutes(app, db);

  // Handle Graphql request
  require("./graphql")(app, db);

  // Handle errors
  require("./errors")(app, db);
};
