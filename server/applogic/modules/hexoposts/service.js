"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let HexoPost = require("./models/hexopost");
let slug = require("../../../../server/libs/slug");

module.exports = {
  settings: {
    name: "hexoposts",
    version: 1,
    namespace: "hexoposts",
    rest: true,
    ws: true,
    graphql: true,
    permission: C.PERM_LOGGEDIN,
    role: "user",
    collection: HexoPost,
    modelPropFilter:
      "code title excerpt createdAt updatedAt votes voters views author more published comments permalink link tags categories slug",
    modelPopulates: {
      author: { service: "persons" },
      voters: { service: "persons" },
      tags: { service: "tags", ref: ["id", "tag_id"] },
      categories: { service: "categories", ref: ["id", "category_id"] }
    }
  },

  actions: {
    find: {
      cache: true,
      permission: C.PERM_PUBLIC,
      handler(ctx) {
        let filter = {};

        if (ctx.params.filter == "my") filter.author = ctx.user.id;
        else if (ctx.params.author != null) {
          filter.author = this.personService.decodeID(ctx.params.author);
        }

        let query = HexoPost.find(filter);

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
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

        return HexoPost.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } })
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
      handler(ctx) {
        this.validateParams(ctx, true);

        console.info("Invocation of the post creation");

        let postData = ctx.params;
        postData.author = ctx.user.id;
        postData.slug = slug.slugIfMissing(postData.title, postData.slug);

        let post = new HexoPost(postData);

        return post
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
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));
        this.validateParams(ctx);

        return this.collection
          .findById(ctx.modelID)
          .exec()
          .then(doc => {
            //TODO:: fill the doc
            // postData.slug = slug.slugIfMissing(postData.title, postData.slug);
            if (ctx.params.title != null) doc.title = ctx.params.title;

            if (ctx.params.content != null) doc.content = ctx.params.content;

            doc.editedAt = Date.now();
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
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

        return HexoPost.remove({ _id: ctx.modelID })
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
      permission: C.PERM_PUBLIC,
      handler(ctx) {
        return HexoPost.remove({})
          .then(() => {
            return ctx.model;
          })
          .then(json => {
            this.notifyModelChanges(ctx, "removedAll", json);
            return json;
          });
      }
    },

    pages: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const pageOptions = {
          page: Math.min(parseInt(ctx.params.page) || 0, 0),
          limit: Math.min(
            parseInt(ctx.params.limit) || config.paging.default_limit,
            config.paging.max_limit
          )
        };

        return this.collection
          .find({}, "code")
          .skip(pageOptions.page * pageOptions.limit)
          .limit(pageOptions.limit)
          .sort("-createdAt")
          .exec()
          .then(doc => {
            return this.toJSON(doc);
          });
      }
    },

    pageCount: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const limit = Math.min(
          parseInt(ctx.params.limit) || config.paging.default_limit,
          config.paging.max_limit
        );

        return this.collection
          .count()
          .exec()
          .then(doc => {
            return this.toJSON(Math.round(doc/limit));
          });
      }
    },

    vote(ctx) {
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      return this.collection
        .findById(ctx.modelID)
        .exec()
        .then(doc => {
          // Check user is on voters
          if (doc.voters.indexOf(ctx.user.id) !== -1)
            throw ctx.errorBadRequest(
              C.ERR_ALREADY_VOTED,
              ctx.t("app:YouHaveAlreadyVotedThisHexoPost")
            );
          return doc;
        })
        .then(doc => {
          // Add user to voters
          return HexoPost.findByIdAndUpdate(
            doc.id,
            { $addToSet: { voters: ctx.user.id }, $inc: { votes: 1 } },
            { new: true }
          );
        })
        .then(doc => {
          return this.toJSON(doc);
        })
        .then(json => {
          return this.populateModels(json);
        })
        .then(json => {
          this.notifyModelChanges(ctx, "voted", json);
          return json;
        });
    },

    unvote(ctx) {
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      return this.collection
        .findById(ctx.modelID)
        .exec()
        .then(doc => {
          // Check user is on voters
          if (doc.voters.indexOf(ctx.user.id) == -1)
            throw ctx.errorBadRequest(
              C.ERR_NOT_VOTED_YET,
              ctx.t("app:YouHaveNotVotedThisHexoPostYet")
            );
          return doc;
        })
        .then(doc => {
          // Remove user from voters
          return HexoPost.findByIdAndUpdate(
            doc.id,
            { $pull: { voters: ctx.user.id }, $inc: { votes: -1 } },
            { new: true }
          );
        })
        .then(doc => {
          return this.toJSON(doc);
        })
        .then(json => {
          return this.populateModels(json);
        })
        .then(json => {
          this.notifyModelChanges(ctx, "unvoted", json);
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
      if (strictMode || ctx.hasParam("title"))
        ctx
          .validateParam("title")
          .trim()
          .notEmpty(ctx.t("app:HexoPostTitleCannotBeEmpty"))
          .end();

      if (strictMode || ctx.hasParam("content"))
        ctx
          .validateParam("content")
          .trim()
          .notEmpty(ctx.t("app:HexoPostContentCannotBeEmpty"))
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
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      if (ctx.model.author.code == ctx.user.code || ctx.isAdmin()) resolve();
      else reject();
    });
  },

  init(ctx) {
    // Fired when start the service
    this.personService = ctx.services("persons");
    this.tagService = ctx.services("tags");
    this.categoryService = ctx.services("categories");

    // Add custom error types
    C.append(["ALREADY_VOTED", "NOT_VOTED_YET"], "ERR");
  },

  socket: {
    afterConnection(socket, io) {
      // Fired when a new client connected via websocket
    }
  },

  graphql: {
    query: `
			posts(limit: Int, offset: Int, sort: String): [HexoPost]
			post(code: String): HexoPost
		`,

    types: `
			type HexoPost {
				code: String!
				title: String,
				excerpt: String,
				content: String
				author: Person!
				views: Int
				votes: Int,
				voters(limit: Int, offset: Int, sort: String): [Person]
				createdAt: Timestamp
				published: Timestamp
			}
		`,

    mutation: `
			postCreate(title: String!, content: String!): HexoPost
			postUpdate(code: String!, title: String, content: String): HexoPost
			postRemove(code: String!): HexoPost

			postVote(code: String!): HexoPost
			postUnvote(code: String!): HexoPost
		`,

    resolvers: {
      Query: {
        posts: "find",
        post: "get"
      },

      Mutation: {
        postCreate: "create",
        postUpdate: "update",
        postRemove: "remove",
        postVote: "vote",
        postUnvote: "unvote"
      }
    }
  }
};

/*
## GraphiQL test ##

# Find all posts
query getHexoPosts {
  posts(sort: "-createdAt -votes", limit: 3) {
    ...postFields
  }
}

# Create a new post
mutation createHexoPost {
  postCreate(title: "New post", content: "New post content") {
    ...postFields
  }
}

# Get a post
query getHexoPost($code: String!) {
  post(code: $code) {
    ...postFields
  }
}

# Update an existing post
mutation updateHexoPost($code: String!) {
  postUpdate(code: $code, content: "Modified post content") {
    ...postFields
  }
}

# vote the post
mutation voteHexoPost($code: String!) {
  postVote(code: $code) {
    ...postFields
  }
}

# unvote the post
mutation unVoteHexoPost($code: String!) {
  postUnvote(code: $code) {
    ...postFields
  }
}

# Remove a post
mutation removeHexoPost($code: String!) {
  postRemove(code: $code) {
    ...postFields
  }
}



fragment postFields on HexoPost {
    code
    title
    content
    author {
      code
      fullName
      username
      avatar
    }
    views
    votes
  	voters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
}

*/
