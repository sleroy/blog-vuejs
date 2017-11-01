let _ = require("lodash");
let express = require("express");
let Context = require("../../core/context");
let logger = require("../../core/logger");
let response = require("../../core/response");
let auth = require("../../core/auth/helper");
let restHandlerFactory = require("./restHandler");

exports.registerRoutes = function(self) {
  _.forIn(self.services, (service, name) => {
    logger.info("Register routes for %s", name);
    if (service.$settings.rest !== false && service.actions) {
      let router = express.Router();

      // Trying authenticate with API key
      router.use(auth.tryAuthenticateWithApiKey);

      let idParamName = service.$settings.idParamName || "id";

      let lastRoutes = [];

      _.forIn(service.actions, (actionFunc, name) => {
        let action = actionFunc.settings;
        action.handler = actionFunc;

        if (!_.isFunction(action.handler))
          throw new Error(
            `Missing handler function in '${name}' action in '${service.name}' service!`
          );

        const handler = restHandlerFactory.createRestHandler(
          self,
          service,
          action,
          self.app
        );

        if (action.isAtomic === undefined || action.isAtomic === false) {
          // Register handler to GET and POST method types
          // So you can call the /api/namespace/action with these request methods.
          //
          // 		GET  /api/namespace/vote?id=123
          // 		POST /api/namespace/vote?id=123
          router.get("/" + name, handler);
          router.post("/" + name, handler);
        }
        if (action.isAtomic === true) {
          // You can call with ID in the path
          // 		GET  /api/namespace/123/vote
          // 		POST /api/namespace/123/vote
          router.get("/:" + idParamName + "/" + name, handler);
          router.post("/:" + idParamName + "/" + name, handler);
        }

        // Create default RESTful handlers
        switch (name) {
          // You can call the `find` action with
          // 		GET /api/namespace/
          case "find": {
            router.get("/", handler);
            break;
          }

          // You can call the `get` action with
          // 		GET /api/namespace/?id=123
          // 	or
          // 		GET /api/namespace/123
          case "get": {
            // router.get("/:" + idParamName, handler);
            lastRoutes.push({
              method: "get",
              path: "/:" + idParamName,
              handler: handler
            });
            break;
          }

          // You can call the `create` action with
          // 		POST /api/namespace/
          case "create": {
            // router.post("/:" + idParamName, handler);
            lastRoutes.push({
              method: "post",
              path: "/:" + idParamName,
              handler: handler
            });
            router.post("/", handler);
            break;
          }

          // You can call the `update` action with
          // 		PUT /api/namespace/?id=123
          // 	or
          // 		PATCH /api/namespace/?id=123
          // 	or
          // 		PUT /api/namespace/123
          // 	or
          // 		PATCH /api/namespace/123
          case "update": {
            // router.put("/:" + idParamName, handler);
            lastRoutes.push({
              method: "put",
              path: "/:" + idParamName,
              handler: handler
            });
            // router.patch("/:" + idParamName, handler);
            lastRoutes.push({
              method: "patch",
              path: "/:" + idParamName,
              handler: handler
            });

            router.put("/", handler);
            router.patch("/", handler);
            break;
          }

          // You can call the `remove` action with
          // 		DELETE /api/namespace/?id=123
          // 	or
          // 		DELETE /api/namespace/123
          case "remove": {
            // router.delete("/:" + idParamName, handler);
            lastRoutes.push({
              method: "delete",
              path: "/:" + idParamName,
              handler: handler
            });
            router.delete("/", handler);
            break;
          }

          case "removeAll": {
            // router.delete("/:" + idParamName, handler);
            lastRoutes.push({
              method: "delete",
              path: "/removeAll",
              handler: handler
            });
            router.delete("/", handler);
            break;
          }
        }
      });

      // Register '/:code' routes
      lastRoutes.forEach(item => {
        router[item.method](item.path, item.handler);
      });

      // Register router to namespace
      self.app.use("/api/" + service.namespace, router);

      // Register a version namespace
      if (service.version) {
        self.app.use(
          "/api/v" + service.version + "/" + service.namespace,
          router
        );
      }
    }
  });
};
