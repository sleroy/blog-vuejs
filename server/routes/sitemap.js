"use strict";

let config = require("../config");
let logger = require("../core/logger");

let serviceLoader = require("../services/serviceLoader");

module.exports = function(app, db) {
  function getSitemap(app) {
    const now = new Date().toString();

    const tagService = serviceLoader.get("tags");

    const routeMap = { "/sitemap.xml": ["get"], "/robots.txt": ["get"] };
    const routeInfo = {
      "/sitemap.xml": { lastmod: now, changefreq: "always", priority: 1.0 },
      "/robots.txt": { lastmod: now, changefreq: "always", priority: 1.0 },
      "/test": { lastmod: now, changefreq: "always", priority: 1.0 }
    };

    tagService.collection.find({}, function(req, res) {
      logger.info("res", res.length);
      for (let tag of res) {
        const tagRoute = "/tags/" + res.name;
        routeMap[tagRoute] = ["get"];
        routeInfo[tagRoute] = {
          tagRoute: { lastmod: now, changefreq: "always", priority: 1.0 }
        };
      }
    });

    let sitemap = require("express-sitemap")({
      sitemap: "sitemap.xml",
      robots: "robots.txt",
      //generate: app,
      sitemapSubmission: "/sitemap.xml",
      map: routeMap,
      route: routeInfo
    });

    return sitemap;
  }

  app.get("/sitemap.xml", (req, res) => {
    // send XML map

    getSitemap(app).XMLtoWeb(res);
  });

  app.get("/robots.txt", (req, res) => {
    // send TXT map
    getSitemap(app).TXTtoWeb(res);
  });
};
