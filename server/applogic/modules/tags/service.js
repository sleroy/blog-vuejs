"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let Tag = require("./models/tags");
let slug = require("../../../core/libs/slug");

module.exports = {
  settings: {
    name: "tags",
    version: 1,
    namespace: "tags",
    rest: true,
    ws: true,
    graphql: true,
    permission: C.PERM_LOGGEDIN,
    role: "user",
    collection: Tag,

    modelPropFilter: "code name slug tag_id"
  },

  actions: {
    find: {
      cache: true,
      permission: C.PERM_PUBLIC,
      handler(ctx) {
        let filter = {};

        let query = this.collection.find(filter);
        return ctx
          .queryPageSort(query)
          .exec()
          .then(docs => {
            return this.toJSON(docs);
          });
      }
    },
    findOne: {
      cache: true,
      permission: C.PERM_PUBLIC,
      handler(ctx) {
        let filter = ctx.params.filter;
        let query = this.collection.findOne(filter);
        return ctx
          .queryPageSort(query)
          .exec()
          .then(docs => {
            return this.toJSON(docs);
          });
      }
    },

    // return a model by ID
    get: {
      cache: true,
      permission: C.PERM_PUBLIC,
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:TagNotFound"));
        return Promise.resolve(ctx.model);
      }
    },

    removeAll: {
      permission: C.PERM_PUBLIC,
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
    },

    create(ctx) {
      this.validateParams(ctx, true);

      let tag = new Tag({
        name: ctx.params.name,
        slug: slug.slugIfMissing(ctx.params.name, ctx.params.slug),
        tag_id: ctx.params.tag_id
      });

      return tag
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
    },

    update(ctx) {
      ctx.assertModelIsExist(ctx.t("app:TagNotFound"));
      this.validateParams(ctx);

      return this.collection
        .findById(ctx.modelID)
        .exec()
        .then(doc => {
          if (ctx.params.name != null) doc.name = ctx.params.name;

          if (ctx.params.tag_id != null) doc.tag_id = ctx.params.tag_id;

          if (ctx.params.slug != null || ctx.params.name != null)
            doc.slug = slug.slugIfMissing(ctx.params.name, ctx.params.slug);

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
    },

    remove(ctx) {
      ctx.assertModelIsExist(ctx.t("app:TagNotFound"));

      return this.collection
        .remove({ _id: ctx.modelID })
        .then(() => {
          return ctx.model;
        })
        .then(json => {
          this.notifyModelChanges(ctx, "removed", json);
          return json;
        });
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
      if (strictMode || ctx.hasParam("name"))
        ctx
          .validateParam("name")
          .trim()
          .notEmpty(ctx.t("app:TagNameCannotBeBlank"))
          .end();

      ctx
        .validateParam("tag_id")
        .trim()
        .end();

      if (ctx.hasValidationErrors())
        throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);
    }
  },

  init(ctx) {
    // Fired when start the service
  },

  socket: {
    afterConnection(socket, io) {
      // Fired when a new client connected via websocket
    }
  },

  graphql: {
    query: `
			tags(limit: Int, offset: Int, sort: String): [Tag]
			tag(code: String): Tag
		`,

    types: `
			type Tag {
				name: String
				slug: String
				tag_id: String
			}
		`,

    mutation: `
			tagCreate(name: String!, slug: String!, tag_id: String): Tag
			tagUpdate(code: String!, name: String!, slug: String!, tag_id: String): Tag
			tagRemove(code: String!): Tag
		`,

    resolvers: {
      Query: {
        tags: "find",
        tag: "get"
      },

      Mutation: {
        tagCreate: "create",
        tagUpdate: "update",
        tagRemove: "remove"
      }
    }
  }
};

/*
## GraphiQL test ##

# Find all devices
query getTags {
  devices(sort: "lastCommunication", limit: 5) {
    ...deviceFields
  }
}

# Create a new device
mutation createTag {
  deviceCreate(name: "New device", address: "192.168.0.1", type: "raspberry", description: "My device", status: 1) {
    ...deviceFields
  }
}

# Get a device
query getTag($code: String!) {
  device(code: $code) {
    ...deviceFields
  }
}

# Update an existing device
mutation updateTag($code: String!) {
  deviceUpdate(code: $code, address: "127.0.0.1") {
    ...deviceFields
  }
}

# Remove a device
mutation removeTag($code: String!) {
  deviceRemove(code: $code) {
    ...deviceFields
  }
}

fragment deviceFields on Tag {
    code
    address
    type
    name
    description
    status
    lastCommunication
}

*/
