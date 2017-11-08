"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let Page = require("./models/page");
let slug = require("../../../core/libs/slug");

module.exports = {
  settings: {
    name: "pages",
    version: 1,
    namespace: "pages",
    rest: true,
    ws: true,
    permission: C.PERM_LOGGEDIN,
    role: "user",
    collection: Page,
    modelPropFilter:
      "code title excerpt createdAt updatedAt author slug coverImage coverCaption content day month year",

    modelPopulates: {
      author: { service: "persons" }
    }
  },

  actions: {
    find: {
      cache: false,
      permission: C.PERM_PUBLIC,
      mapping: {
        path: "/",
        method: "get"
      },
      handler(ctx) {
        logger.info("Filtering received ", ctx.params.filter);
        logger.info("Params received ", ctx.params);
        let filter = ctx.params;
        if (ctx.params.filter == "my") filter.author = ctx.user.id;
        else if (ctx.params.author != null) {
          filter.author = this.personService.decodeID(ctx.params.author);
        }

        let query = Page.find(filter);

        return ctx
          .queryPageSort(query)
          .exec()
          .then(docs => {
            return this.toJSON(docs);
          })
          .then(json => {
            return this.populateModels(json);
          });
      }
    },

    // return a model by ID
    get: {
      cache: true, // if true, we don't increment the views!
      permission: C.PERM_PUBLIC,
      mapping: {
        path: "/:id",
        method: "get"
      },
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:PageNotFound"));

        return Page.findByIdAndUpdate(ctx.modelID)
          .exec()
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          });
      }
    },

    create: {
      mapping: {
        path: "/",
        method: "post"
      },
      handler(ctx) {
        this.validateParams(ctx, true);

        console.info("Invocation of the page creation");

        let pageData = ctx.params;
        pageData.author = ctx.user.id;
        pageData.slug = slug.slugIfMissing(pageData.title, pageData.slug);

        let page = new Page(pageData);

        return page
          .save()
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .then(json => {
            this.notifyModelChanges(ctx, "created", json);
            return json;
          });
      }
    },

    update: {
      permission: C.PERM_OWNER,
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:PageNotFound"));
        this.validateParams(ctx);

        return this.collection
          .findById(ctx.modelID)
          .exec()
          .then(doc => {
            //TODO:: fill the doc
            // postData.slug = slug.slugIfMissing(postData.title, postData.slug);
            if (ctx.params.title != null) doc.title = ctx.params.title;

            if (ctx.params.content != null) doc.content = ctx.params.content;

            doc.updatedAt = Date.now();
            return doc.save();
          })
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .then(json => {
            this.notifyModelChanges(ctx, "updated", json);
            return json;
          });
      }
    },

    remove: {
      permission: C.PERM_OWNER,
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:PageNotFound"));

        return Page.remove({ _id: ctx.modelID })
          .then(() => {
            return ctx.model;
          })
          .then(json => {
            this.notifyModelChanges(ctx, "removed", json);
            return json;
          });
      }
    },

    removeAll: {
      permission: C.PERM_LOGGEDIN,
      handler(ctx) {
        return this.collection
          .remove({})
          .then(() => {
            return ctx.model;
          })
          .then(json => {
            this.notifyModelChanges(ctx, "removedAll", json);
            return json;
          });
      }
    }
  },

  methods: {
    /**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 *
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
    validateParams(ctx, strictMode) {
      if (strictMode || ctx.hasParam("title"))
        ctx
          .validateParam("title")
          .trim()
          .notEmpty(ctx.t("app:PageTitleCannotBeEmpty"))
          .end();

      if (strictMode || ctx.hasParam("content"))
        ctx
          .validateParam("content")
          .trim()
          .notEmpty(ctx.t("app:PageContentCannotBeEmpty"))
          .end();

      if (ctx.hasValidationErrors())
        throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);
    }
  },

  /**
	 * Check the owner of model
	 *
	 * @param {any} ctx	Context of request
	 * @returns	{Promise}
	 */
  ownerChecker(ctx) {
    return new Promise((resolve, reject) => {
      ctx.assertModelIsExist(ctx.t("app:PageNotFound"));

      if (ctx.model.author.code == ctx.user.code || ctx.isAdmin()) resolve();
      else reject();
    });
  },

  init(ctx) {
    // Fired when start the service
    this.personService = ctx.services("persons");
  },

  socket: {
    afterConnection(socket, io) {
      // Fired when a new client connected via websocket
    }
  },

  graphql: {}
};
