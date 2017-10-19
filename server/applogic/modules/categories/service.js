"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Category = require("./models/categories");
let slug = require("../../../../server/libs/slug");

module.exports = {
	settings: {
		name: "categories",
		version: 1,
		namespace: "categories",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Category,
		modelPropFilter: "code name slug category_id"
	},

	actions: {
		find: {
			cache: true,
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				let filter = {};

				let query = this.collection.find(filter);
				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true,
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:CategoryNotFound"));
				return Promise.resolve(ctx.model);
			}
		},

		create(ctx) {
			this.validateParams(ctx, true);

			let category = new Category({
				name: ctx.params.name,
				slug: slug.slugIfMissing(ctx.params.name, ctx.params.slug),
				category_id: ctx.params.category_id
			});



			return category.save()
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "created", json);
				return json;
			});
		},

		update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:CategoryNotFound"));
			this.validateParams(ctx);

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {

				if (ctx.params.name != null)
					doc.name = ctx.params.name;

				if (ctx.params.category_id != null)
					doc.category_id = ctx.params.category_id;

				if (ctx.params.slug != null || ctx.params.name != null)
					doc.slug = slug.slugIfMissing(ctx.params.name, ctx.params.slug);

				return doc.save();
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "updated", json);
				return json;
			});
		},

		remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:CategoryNotFound"));

			return this.collection.remove({ _id: ctx.modelID })
			.then(() => {
				return ctx.model;
			})
			.then((json) => {
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
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:CategoryNameCannotBeBlank")).end();


			ctx.validateParam("category_id").trim().end();


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
			categories(limit: Int, offset: Int, sort: String): [Category]
			category(code: String): Category
		`,

		types: `
			type Category {
				name: String
				slug: String
				category_id: String
			}
		`,

		mutation: `
			categoryCreate(name: String!, slug: String!, category_id: String): Category
			categoryUpdate(code: String!, name: String!, slug: String!, category_id: String): Category
			categoryRemove(code: String!): Category
		`,

		resolvers: {
			Query: {
				categories: "find",
				category: "get"
			},

			Mutation: {
				categoryCreate: "create",
				categoryUpdate: "update",
				categoryRemove: "remove"
			}
		}
	}

};

/*
## GraphiQL test ##

# Find all devices
query getCategorys {
  devices(sort: "lastCommunication", limit: 5) {
    ...deviceFields
  }
}

# Create a new device
mutation createCategory {
  deviceCreate(name: "New device", address: "192.168.0.1", type: "raspberry", description: "My device", status: 1) {
    ...deviceFields
  }
}

# Get a device
query getCategory($code: String!) {
  device(code: $code) {
    ...deviceFields
  }
}

# Update an existing device
mutation updateCategory($code: String!) {
  deviceUpdate(code: $code, address: "127.0.0.1") {
    ...deviceFields
  }
}

# Remove a device
mutation removeCategory($code: String!) {
  deviceRemove(code: $code) {
    ...deviceFields
  }
}

fragment deviceFields on Category {
    code
    address
    type
    name
    description
    status
    lastCommunication
}

*/
