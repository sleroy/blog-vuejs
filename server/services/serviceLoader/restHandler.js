let Context = require("../../core/context");
let logger = require("../../core/logger");
let response = require("../../core/response");

exports.createRestHandler = function(self, service, action, app) {
  // Make the request handler for action
  let handler = (req, res) => {
    let ctx = Context.CreateFromREST(service, action, app, req, res);
    logger.debug(
      `Request via REST '${service.namespace}/${action.name}' (ID: ${ctx.id})`,
      ctx.params
    );
    console.time("REST request");
    self.emit("request", ctx);

    let cacheKey = service.getCacheKey(action.name, ctx.params);

    Promise.resolve()
      // Resolve model if ID provided
      .then(() => {
        return ctx.resolveModel();
      })
      // Check permission
      .then(() => {
        return ctx.checkPermission();
      })
      // Call the action handler
      .then(() => {
        return action.handler(ctx);
      })
      // Response the result
      .then(json => {
        res.append("Request-Id", ctx.id);
        response.json(res, json);
      })
      // Response the error
      .catch(err => {
        logger.error(err);
        response.json(res, null, err);
      })
      .then(() => {
        self.emit("response", ctx);
        console.timeEnd("REST request");
        //logger.debug("Response time:", ctx.responseTime(), "ms");
      });
  };
  return handler;
}
